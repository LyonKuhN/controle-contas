
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingDown, TrendingUp, FileText } from 'lucide-react';

const NavigationIsland = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: TrendingDown, label: 'Despesas', path: '/despesas' },
    { icon: TrendingUp, label: 'Receitas', path: '/receitas' },
    { icon: FileText, label: 'Contas', path: '/controle-contas' },
  ];

  return (
    <div className="nav-island">
      <div className="flex items-center gap-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'nav-item-active' : ''}`}
          >
            <item.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NavigationIsland;
