
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

const menuItems = [
  {
    title: "Dashboard",
    description: "Acompanhe seus gastos e receitas com gráficos detalhados",
    icon: "📊",
    path: "/dashboard",
    gradient: false
  },
  {
    title: "Despesas",
    description: "Registre e categorize todos os seus gastos mensais",
    icon: "💸",
    path: "/despesas",
    gradient: false,
    hoverGradient: true
  },
  {
    title: "Receitas",
    description: "Controle todas as suas fontes de renda",
    icon: "💰",
    path: "/receitas",
    gradient: false
  },
  {
    title: "Controle de Contas",
    description: "Gerencie suas contas e acompanhe pagamentos",
    icon: "📋",
    path: "/controle-contas",
    gradient: false
  }
];

const MainMenu = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">
            Controle Financeiro
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gerencie suas finanças pessoais de forma simples e eficiente
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {menuItems.map((item, index) => (
            <Link key={item.path} to={item.path} className="group">
              <Card 
                className={`
                  p-8 h-80 flex flex-col justify-between card-hover cursor-pointer
                  ${item.gradient 
                    ? 'bg-gradient-primary text-white border-none' 
                    : item.hoverGradient
                    ? 'bg-card hover:bg-gradient-primary border-border transition-all duration-500 hover:text-white hover:border-none'
                    : 'bg-card hover:bg-card/80 border-border'
                  }
                `}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="space-y-4">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-2xl font-bold">{item.title}</h3>
                  <p className={`text-sm leading-relaxed transition-colors duration-500 ${
                    item.gradient ? 'text-white/80' : 'text-muted-foreground group-hover:text-white/80'
                  }`}>
                    {item.description}
                  </p>
                </div>
                <div className="mt-8">
                  <span className={`text-sm font-medium transition-colors duration-500 ${
                    item.gradient ? 'text-white' : 'text-primary group-hover:text-white'
                  }`}>
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
