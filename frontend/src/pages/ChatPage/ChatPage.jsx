import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import styles from './ChatPage.module.css'

function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy el asistente de Patrimonio Info. Puedo ayudarte a consultar información sobre bienes patrimoniales, informes de conservación y documentación técnica. ¿En qué puedo ayudarte?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const sessionId = useRef(`session_${user?.id || 'anonymous'}_${Date.now()}`)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_AI_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId.current,
          mensaje: userMessage
        })
      })

      if (!res.ok) throw new Error('Error al contactar con el agente')

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.respuesta }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error. Por favor inténtalo de nuevo.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Asistente IA</h1>
        <p className={styles.subtitle}>Consulta información sobre el patrimonio cultural de Gran Canaria</p>
      </div>

      <div className={styles.chatBox}>
        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
            >
              <div className={styles.messageContent}>
                <span className={styles.roleIcon}>
                  {msg.role === 'user' ? '👤' : '🏛️'}
                </span>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.message} ${styles.assistantMessage}`}>
              <div className={styles.messageContent}>
                <span className={styles.roleIcon}>🏛️</span>
                <p className={styles.typing}>Pensando...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className={styles.inputRow}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta..."
            className={styles.input}
            disabled={loading}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={loading || !input.trim()}
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatPage
