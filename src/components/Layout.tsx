import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { username, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${
      isActive
        ? 'bg-indigo-700 text-white'
        : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg tracking-tight">
                💱 Currency Converter
              </span>
              <div className="hidden sm:flex ml-6 gap-1">
                <NavLink to="/convert" className={linkClass}>
                  Convert
                </NavLink>
                <NavLink to="/rates" className={linkClass}>
                  Latest Rates
                </NavLink>
                <NavLink to="/history" className={linkClass}>
                  History
                </NavLink>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-indigo-100 text-sm hidden sm:inline">
                {username}{' '}
                <span className="text-xs opacity-75">({role})</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-indigo-800 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-900 transition"
              >
                Logout
              </button>
            </div>
          </div>
          {/* Mobile nav */}
          <div className="flex sm:hidden gap-1 pb-3">
            <NavLink to="/convert" className={linkClass}>
              Convert
            </NavLink>
            <NavLink to="/rates" className={linkClass}>
              Rates
            </NavLink>
            <NavLink to="/history" className={linkClass}>
              History
            </NavLink>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
