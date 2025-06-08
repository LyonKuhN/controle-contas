
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { House, PieChart, FileText, DollarSign, RefreshCw } from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    description: "Acompanhe seus gastos e receitas com gráficos detalhados",
    icon: "📊",
    path: "/dashboard"
  },
  {
    title: "Despesas",
    description: "Registre e categorize todos os seus gastos mensais",
    icon: "💸",
    path: "/despesas"
  },
  {
    title: "Receitas",
    description: "Controle todas as suas fontes de renda",
    icon: "💰",
    path: "/receitas"
  },
  {
    title: "Controle de Contas",
    description: "Gerencie suas contas e acompanhe pagamentos",
    icon: "📋",
    path: "/controle-contas"
  }
];

const navigationItems = [
  { icon: House, path: "/", label: "Home" },
  { icon: PieChart, path: "/dashboard", label: "Dashboard" },
  { icon: FileText, path: "/despesas", label: "Despesas" },
  { icon: DollarSign, path: "/receitas", label: "Receitas" },
  { icon: RefreshCw, path: "/controle-contas", label: "Controle" }
];

const MainMenu = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation Island */}
      <div className="container mx-auto px-4 py-6">
        <div className="nav-island max-w-md mx-auto p-4 mb-8">
          <div className="flex justify-center items-center space-x-6">
            {navigationItems.map((item, index) => (
              <Link 
                key={item.path} 
                to={item.path}
                className="p-3 rounded-full hover:bg-white/20 transition-all duration-300 text-white/80 hover:text-white"
                title={item.label}
              >
                <item.icon size={24} />
              </Link>
            ))}
          </div>
        </div>

        {/* Header with Subtle Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent mb-4">
            Controle Financeiro
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Gerencie suas finanças pessoais de forma simples e eficiente
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {menuItems.map((item, index) => (
            <Link key={item.path} to={item.path} className="group">
              <Card 
                className="menu-card-hover p-8 h-80 flex flex-col justify-between cursor-pointer"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="space-y-4">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-2xl font-bold menu-text text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed menu-description text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="mt-8">
                  <span className="text-sm font-medium menu-text text-primary group-hover:text-white transition-colors duration-500">
                    Explorar →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
