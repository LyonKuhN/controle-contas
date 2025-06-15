
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import NavigationIsland from "./NavigationIsland";
import MobileNavigation from "./MobileNavigation";
import ThemeToggle from "./ThemeToggle";
import SupportDialog from "./SupportDialog";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  {
    title: "Dashboard",
    description: "Acompanhe seus gastos e receitas com gráficos detalhados e análises financeiras",
    icon: "📊",
    path: "/dashboard"
  },
  {
    title: "Despesas",
    description: "Registre e categorize todos os seus gastos mensais, controle orçamento familiar",
    icon: "💸",
    path: "/despesas"
  },
  {
    title: "Recebimentos",
    description: "Controle todas as suas fontes de renda, salários, freelances e receitas extras",
    icon: "💰",
    path: "/receitas"
  },
  {
    title: "Controle de Contas",
    description: "Gerencie suas contas a pagar e receber, acompanhe vencimentos e fluxo de caixa",
    icon: "📋",
    path: "/controle-contas"
  }
];

const MainMenu = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-start mb-4">
            {/* Left side - Support Button */}
            <div className="flex items-center">
              <SupportDialog variant="outline" size="sm" />
            </div>
            
            {/* Right side - Theme Toggle and Profile */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user && (
                <Link to="/profile">
                  <Button
                    variant="outline"
                    size="sm"
                    className="nav-island flex items-center gap-2 bg-transparent border-primary/20 text-foreground hover:bg-primary/10"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Perfil</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          {/* Navigation Island - Centered */}
          <NavigationIsland />
        </div>
      </div>

      {/* Mobile Layout - Top Header */}
      <div className="md:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-foreground">LYONPAY</h1>
            <SupportDialog variant="outline" size="sm" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24 md:pb-0">
        {/* Header with Subtle Title */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img 
              src="/lovable-uploads/4fec2beb-6c7e-4cea-a53b-51b0335866ca.png" 
              alt="LYONPAY - Sistema de Controle Financeiro"
              className="w-16 h-16 object-contain"
            />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              LYONPAY
            </h1>
          </div>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Sistema completo de controle financeiro pessoal - Gerencie suas finanças de forma simples e eficiente
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

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default MainMenu;
