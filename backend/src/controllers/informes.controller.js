import { prisma } from '../config/db.js'
import { enviarNotificacionInforme } from '../config/email.js'

// GET /api/informes
export const listarInformes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, estado, bienId } = req.query
    const { id: usuarioId, rol } = req.usuario

    const skip = (Number(page) - 1) * Number(limit)
    const where = {}

    // Restauradores solo ven sus informes, admin ve todos
    if (rol !== 'ADMIN') {
      where.restauradorId = usuarioId
    }

    if (estado && ['EN_CURSO', 'FINALIZADO', 'PENDIENTE'].includes(estado)) {
      where.estado = estado
    }

    if (bienId) {
      where.bienId = Number(bienId)
    }

    const [informes, total] = await Promise.all([
      prisma.informe.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { bien: true, restaurador: { select: { nombre: true, email: true } } }
      }),
      prisma.informe.count({ where })
    ])

    res.json({
      data: informes,
      total,
      pagina: Number(page),
      totalPaginas: Math.ceil(total / Number(limit))
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/informes/:id
export const obtenerInforme = async (req, res, next) => {
  try {
    const { id } = req.params
    const { id: usuarioId, rol } = req.usuario

    const informe = await prisma.informe.findUnique({
      where: { id: Number(id) },
      include: {
        bien: true,
        restaurador: { select: { id: true, nombre: true, email: true } },
        materiales: true
      }
    })

    if (!informe) {
      return res.status(404).json({ error: 'Informe no encontrado' })
    }

    // Verificar permisos (restaurador solo su informe, admin todo)
    if (rol !== 'ADMIN' && informe.restauradorId !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permisos para ver este informe' })
    }

    res.json(informe)
  } catch (err) {
    next(err)
  }
}

// POST /api/informes
export const crearInforme = async (req, res, next) => {
  try {
    const { titulo, diagnostico, tratamiento, procedimientos, fechaInicio, bienId, materiales } = req.body
    const { id: usuarioId } = req.usuario

    if (!titulo || !diagnostico || !tratamiento || !bienId) {
      return res.status(400).json({ error: 'Campos obligatorios faltantes' })
    }

    // Verificar que el bien existe
    const bien = await prisma.bien.findUnique({ where: { id: Number(bienId) } })
    if (!bien) {
      return res.status(404).json({ error: 'Bien no encontrado' })
    }

    const informe = await prisma.informe.create({
      data: {
        titulo,
        diagnostico,
        tratamiento,
        procedimientos,
        fechaInicio: new Date(fechaInicio),
        bienId: Number(bienId),
        restauradorId: usuarioId,
        materiales: {
          create: materiales || []
        }
      },
      include: { bien: true, restaurador: { select: { nombre: true } }, materiales: true }
    })
// Enviar notificación por email (no bloqueante)
enviarNotificacionInforme({
  titulo: informe.titulo,
  bien: informe.bien.nombre,
  restaurador: informe.restaurador.nombre,
  estado: informe.estado
}).catch(err => console.error('Error enviando webhook N8N:', err))
    res.status(201).json(informe)
  } catch (err) {
    next(err)
  }
}

// PUT /api/informes/:id
export const actualizarInforme = async (req, res, next) => {
  try {
    const { id } = req.params
    const { id: usuarioId, rol } = req.usuario
    const { titulo, diagnostico, tratamiento, procedimientos, estado, fechaFin, materiales } = req.body

    const informe = await prisma.informe.findUnique({ where: { id: Number(id) } })
    if (!informe) {
      return res.status(404).json({ error: 'Informe no encontrado' })
    }

    // Verificar permisos
    if (rol !== 'ADMIN' && informe.restauradorId !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permisos para editar este informe' })
    }

    // Actualizar materiales si se proporcionan
    if (materiales && Array.isArray(materiales)) {
      await prisma.materialInforme.deleteMany({ where: { informeId: Number(id) } })
      await prisma.materialInforme.createMany({
        data: materiales.map(m => ({ ...m, informeId: Number(id) }))
      })
    }

    const actualizado = await prisma.informe.update({
      where: { id: Number(id) },
      data: {
        titulo,
        diagnostico,
        tratamiento,
        procedimientos,
        estado,
        fechaFin: fechaFin ? new Date(fechaFin) : undefined
      },
      include: { bien: true, restaurador: { select: { nombre: true } }, materiales: true }
    })

    res.json(actualizado)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/informes/:id
export const eliminarInforme = async (req, res, next) => {
  try {
    const { id } = req.params
    const { id: usuarioId, rol } = req.usuario

    const informe = await prisma.informe.findUnique({ where: { id: Number(id) } })
    if (!informe) {
      return res.status(404).json({ error: 'Informe no encontrado' })
    }

    // Solo admin o propietario
    if (rol !== 'ADMIN' && informe.restauradorId !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este informe' })
    }

    await prisma.informe.delete({ where: { id: Number(id) } })

    res.json({ ok: true, mensaje: 'Informe eliminado' })
  } catch (err) {
    next(err)
  }
}
