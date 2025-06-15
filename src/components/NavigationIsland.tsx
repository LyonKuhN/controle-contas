
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingDown, TrendingUp, FileText } from 'lucide-react';

const NavigationIsland = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: TrendingDown, label: 'Despesas', path: '/despesas' },
    { icon: TrendingUp, label: 'Recebimentos', path: '/receitas' },
    { icon: FileText, label: 'Contas', path: '/controle-contas' },
  ];

  return (
    <div className="flex justify-center">
      <div className="bg-background/80 backdrop-blur-md border border-border rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationIsland;
