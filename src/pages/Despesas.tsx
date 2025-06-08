
import { Card } from "@/components/ui/card";
import CadastroDespesas from "@/components/despesas/CadastroDespesas";
import ListaDespesas from "@/components/despesas/ListaDespesas";
import NavigationIsland from "@/components/NavigationIsland";

const Despesas = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20">
      <NavigationIsland />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">💸 Despesas</h1>
          <p className="text-muted-foreground">Registre e categorize todos os seus gastos mensais</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Cadastro */}
          <CadastroDespesas />
          
          {/* Lista de Despesas */}
          <ListaDespesas />
        </div>
      </div>
    </div>
  );
};

export default Despesas;
