
import { Link, useLocation } from "react-router-dom";
import { House, FileText, DollarSign, RefreshCw } from "lucide-react";

const navigationItems = [
  { icon: House, path: "/", label: "Home" },
  { icon: FileText, path: "/despesas", label: "Despesas" },
  { icon: DollarSign, path: "/receitas", label: "Receitas" },
  { icon: RefreshCw, path: "/controle-contas", label: "Controle" }
];

const NavigationIsland = () => {
  const location = useLocation();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="nav-island max-w-md mx-auto p-4">
        <div className="flex justify-center items-center space-x-6">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`p-3 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'text-foreground/70 hover:text-foreground hover:bg-primary/10 hover:shadow-md'
                }`}
                title={item.label}
              >
                <item.icon size={24} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NavigationIsland;
