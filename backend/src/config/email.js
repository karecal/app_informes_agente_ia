import fetch from 'node-fetch'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/informe-creado'

export const enviarNotificacionInforme = async ({ titulo, bien, restaurador, estado = 'EN_CURSO' }) => {
  try {
    await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, bien, restaurador, estado })
    })
  } catch (err) {
    console.error('Error enviando webhook a N8N:', err.message)
  }
}
