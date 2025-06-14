
import { Card } from "@/components/ui/card";
import CadastroDespesas from "@/components/despesas/CadastroDespesas";
import ListaDespesas from "@/components/despesas/ListaDespesas";
import ModelosDespesas from "@/components/despesas/ModelosDespesas";
import NavigationIsland from "@/components/NavigationIsland";
import ThemeToggle from "@/components/ThemeToggle";

const Despesas = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20">
      {/* Navigation and Theme Toggle */}
      <div className="container mx-auto px-4 py-6">
        <div className="relative">
          <NavigationIsland />
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">💸 Despesas</h1>
          <p className="text-muted-foreground">Registre e categorize todos os seus gastos mensais</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Cadastro */}
          <div className="space-y-6">
            <CadastroDespesas />
            
            {/* Seção de Modelos */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Gerenciar Modelos</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Visualize e edite os modelos de despesas fixas cadastrados
              </p>
              <ModelosDespesas />
            </Card>
          </div>
          
          {/* Lista de Despesas */}
          <ListaDespesas />
        </div>
      </div>
    </div>
  );
};

export default Despesas;
