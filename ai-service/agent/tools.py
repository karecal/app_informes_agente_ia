import os
from sqlalchemy import create_engine, text
from langchain_core.tools import tool

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

@tool
def consultar_bienes(query: str) -> str:
    """Consulta información sobre bienes patrimoniales y sus informes en la base de datos.
    Úsala cuando el usuario pregunte sobre bienes, municipios, tipos de patrimonio,
    restauradores o informes de conservación."""

    try:
        with engine.connect() as conn:
            resultado = conn.execute(text("""
                SELECT
                    b.nombre,
                    b.tipo,
                    b.municipio,
                    b."tipoPatrimonio",
                    b.estilo,
                    b.ubicacion,
                    b.descripcion,
                    COUNT(i.id) as total_informes
                FROM bienes b
                LEFT JOIN informes i ON b.id = i."bienId"
                GROUP BY b.id, b.nombre, b.tipo, b.municipio,
                         b."tipoPatrimonio", b.estilo, b.ubicacion, b.descripcion
                ORDER BY b.nombre
            """))

            bienes = resultado.fetchall()

            if not bienes:
                return "No se encontraron bienes patrimoniales en la base de datos."

            respuesta = "BIENES PATRIMONIALES REGISTRADOS:\n\n"
            for bien in bienes:
                respuesta += f"- {bien.nombre} ({bien.tipo})\n"
                respuesta += f"  Municipio: {bien.municipio or 'No especificado'}\n"
                respuesta += f"  Ubicación: {bien.ubicacion}\n"
                respuesta += f"  Tipo patrimonio: {bien.tipoPatrimonio or 'No especificado'}\n"
                respuesta += f"  Informes: {bien.total_informes}\n\n"

            return respuesta

    except Exception as e:
        return f"Error al consultar la base de datos: {str(e)}"


@tool
def consultar_informes(bien_nombre: str) -> str:
    """Consulta los informes de conservación-restauración de un bien patrimonial específico.
    Úsala cuando el usuario pregunte sobre intervenciones, tratamientos, materiales
    o el estado de conservación de un bien concreto."""

    try:
        with engine.connect() as conn:
            resultado = conn.execute(text("""
                SELECT
                    i.titulo,
                    i.estado,
                    i."fechaInicio",
                    i."fechaFin",
                    i.diagnostico,
                    i.tratamiento,
                    i.procedimientos,
                    u.nombre as restaurador,
                    b.nombre as bien
                FROM informes i
                JOIN bienes b ON i."bienId" = b.id
                JOIN usuarios u ON i."restauradorId" = u.id
                WHERE LOWER(b.nombre) LIKE LOWER(:nombre)
                ORDER BY i."fechaInicio" DESC
            """), {"nombre": f"%{bien_nombre}%"})

            informes = resultado.fetchall()

            if not informes:
                return f"No se encontraron informes para el bien '{bien_nombre}'."

            respuesta = f"INFORMES DE CONSERVACIÓN — {informes[0].bien}:\n\n"
            for inf in informes:
                respuesta += f"📋 {inf.titulo}\n"
                respuesta += f"   Estado: {inf.estado}\n"
                respuesta += f"   Restaurador: {inf.restaurador}\n"
                respuesta += f"   Inicio: {inf.fechaInicio}\n"
                if inf.fechaFin:
                    respuesta += f"   Fin: {inf.fechaFin}\n"
                respuesta += f"   Diagnóstico: {inf.diagnostico}\n"
                respuesta += f"   Tratamiento: {inf.tratamiento}\n\n"

            return respuesta

    except Exception as e:
        return f"Error al consultar informes: {str(e)}"
