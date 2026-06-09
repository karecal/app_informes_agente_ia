import os
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings
from langchain_core.documents import Document
from langchain_core.tools import tool

CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")

DOCUMENTOS_TECNICOS = [
    Document(
        page_content="""PARALOID B-72
Tipo: Consolidante y adhesivo reversible
Composición: Copolímero acrílico etil metacrilato/metil acrilato
Usos: Consolidación de capas pictóricas, adhesión de fragmentos, fijación de policromías
Concentraciones habituales:
- Consolidación superficial: 2-5% en acetona
- Adhesión de fragmentos: 10-20% en acetona o tolueno
- Fijación de urgencia: 3% en acetona con papel japonés
Ventajas: Alta reversibilidad, estabilidad a largo plazo, no amarillea
Precauciones: Trabajar en zona ventilada, evitar contacto con piel""",
        metadata={"fuente": "Ficha técnica materiales", "material": "Paraloid B-72"}
    ),
    Document(
        page_content="""TRATAMIENTO DE XILÓFAGOS — ANOXIA
Método: Anoxia controlada
Indicado para: Madera con insectos xilófagos activos (carcoma, termitas)
Procedimiento:
1. Introducir la pieza en bolsa de barrera de alta resistencia
2. Añadir absorbedores de oxígeno en proporción adecuada
3. Sellar herméticamente la bolsa
4. Mantener en anoxia durante mínimo 21 días a temperatura ambiente
5. Verificar nivel de oxígeno con indicador colorimétrico
Materiales necesarios: Bolsas anóxicas, absorbedores de oxígeno, indicadores O2
Ventajas: No tóxico, no deja residuos, efectivo contra todas las fases del insecto
Proveedor habitual: Conservatex""",
        metadata={"fuente": "Protocolo intervención", "tratamiento": "Anoxia"}
    ),
    Document(
        page_content="""LIMPIEZA DE PIEDRA — PROTOCOLO
Métodos disponibles:
1. Limpieza mecánica en seco: bisturí, brochas, aspiración controlada
2. Limpieza con agua: agua destilada a baja presión (máx 20 bar)
3. Limpieza química: biocidas para microorganismos, EDTA para depósitos calcáreos
4. Láser: para costras negras en piedra caliza

Biocida recomendado: Preventol RI80 al 2% en agua
Aplicación: Pulverización o con brocha, dejar actuar 24-48h, aclarar con agua destilada

Para rejuntado: Mortero de cal hidráulica NHL 3.5, compatible con piedra histórica
Hidrofugante final: Siloxano al 5% en white spirit""",
        metadata={"fuente": "Protocolo intervención", "tratamiento": "Limpieza piedra"}
    ),
    Document(
        page_content="""REINTEGRACIÓN CROMÁTICA — TÉCNICAS
Criterios generales:
- La reintegración debe ser distinguible a corta distancia pero no perturbadora a distancia normal
- Usar siempre materiales reversibles

Técnicas principales:
1. Rigattino: trazos verticales finos de acuarela, visible de cerca
2. Puntillismo: puntos de color, muy discreta
3. Tinta plana: color neutro que no compite con el original
4. Ilusionista: solo en casos muy justificados y reversible

Materiales recomendados:
- Acuarelas Winsor & Newton: alta calidad, reversibles con agua
- Gamblin Conservation Colors: específicas para restauración
- Dorado: pan de oro al mixtión al agua para mayor reversibilidad""",
        metadata={"fuente": "Protocolo intervención", "tratamiento": "Reintegración cromática"}
    ),
    Document(
        page_content="""NORMATIVA PATRIMONIO CULTURAL CANARIAS
Ley 11/2019 de Patrimonio Cultural de Canarias:
- Toda intervención en bienes catalogados requiere autorización previa
- Los informes de intervención son obligatorios y deben archivarse
- El restaurador debe estar titulado en Conservación y Restauración de Bienes Culturales
- Se debe documentar el estado previo, durante y posterior a la intervención
- Los materiales usados deben ser compatibles, estables y reversibles

Categorías de protección:
- Bien de Interés Cultural (BIC): máxima protección
- Bien Inventariado: protección media
- Bien Catalogado: protección básica municipal""",
        metadata={"fuente": "Normativa", "ley": "Ley 11/2019"}
    )
]

embeddings = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
)

def get_vectorstore():
    return Chroma.from_documents(
        documents=DOCUMENTOS_TECNICOS,
        embedding=embeddings,
        persist_directory=CHROMA_PATH
    )

vectorstore = get_vectorstore()
retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

@tool
def consultar_documentacion_tecnica(consulta: str) -> str:
    """Consulta documentación técnica sobre materiales, tratamientos y protocolos
    de conservación-restauración. Úsala cuando el usuario pregunte sobre materiales,
    técnicas de restauración, normativa o protocolos de intervención."""

    docs = retriever.invoke(consulta)

    if not docs:
        return "No se encontró documentación técnica relevante para esta consulta."

    respuesta = "DOCUMENTACIÓN TÉCNICA RELEVANTE:\n\n"
    for doc in docs:
        respuesta += f"Fuente: {doc.metadata.get('fuente', 'Desconocida')}\n"
        respuesta += f"{doc.page_content}\n\n"
        respuesta += "---\n"

    return respuesta
