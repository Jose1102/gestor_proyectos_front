import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../api/auth';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('authUser');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-page">
      <div className="home-card">
        <h1>Bienvenido</h1>
        {user && (
          <p className="home-user">
            {user.email} <span className="home-role">({user.role})</span>
          </p>
        )}
        <button type="button" onClick={handleLogout} className="home-logout">
          Cerrar sesión
        </button>
        <p className="home-link">
          <Link to="/projects">Ir a Mis proyectos</Link>
        </p>
      </div>
    </div>
  );
}

export default Home;
