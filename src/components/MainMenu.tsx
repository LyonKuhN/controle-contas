
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import NavigationIsland from "./NavigationIsland";
import MobileNavigation from "./MobileNavigation";
import ThemeToggle from "./ThemeToggle";
import SupportDialog from "./SupportDialog";
import { useAuth } from "@/hooks/useAuth";

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

const MainMenu = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <SupportDialog variant="outline" size="sm" />
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user && (
                <Link to="/profile">
                  <Button
                    variant="outline"
                    size="sm"
                    className="nav-island flex items-center gap-2 bg-background/80 border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Perfil</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          <NavigationIsland />
        </div>
      </div>

      {/* Mobile Layout - Top Header Only */}
      <div className="block md:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-foreground">LYONPAY</h1>
            <SupportDialog variant="outline" size="sm" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-6 md:pb-0">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img 
              src="/lovable-uploads/4fec2beb-6c7e-4cea-a53b-51b0335866ca.png" 
              alt="Logo"
              className="w-16 h-16 object-contain"
            />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              LYONPAY
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gerencie suas finanças pessoais de forma simples e eficiente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-20 md:mb-0">
          {menuItems.map((item, index) => (
            <Link key={item.path} to={item.path} className="group">
              <Card 
                className="menu-card-hover p-8 h-80 flex flex-col justify-between cursor-pointer bg-card text-card-foreground border-border hover:border-primary/50"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="space-y-4">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-2xl font-bold menu-text text-card-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed menu-description text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="mt-8">
                  <span className="text-sm font-medium menu-text text-primary group-hover:text-primary transition-colors duration-500">
                    Explorar →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Navigation - Always render */}
      <MobileNavigation />
    </div>
  );
};

export default MainMenu;
