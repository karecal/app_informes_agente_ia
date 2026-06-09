import { Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/patrimonio info.png'
import useClock from '../../hooks/useClock'
import { useAuth } from '../../hooks/useAuth'
import styles from './Navbar.module.css'

function Navbar() {
  const time = useClock()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className={styles.navbar}>
      <Link to="/">
        <img src={logo} alt="Patrimonio Info" className={styles.logo} />
      </Link>
      <div className={styles.right}>
        <Link to="/chat" className={styles.chatLink}>🏛️ Asistente IA</Link>
        <span className={styles.clock}>{time}</span>
        {isAuthenticated ? (
          <>
            <span className={styles.userName}>👤 {user?.nombre}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/login" className={styles.loginBtn}>Iniciar sesión</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar