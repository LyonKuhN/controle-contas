
import NavigationIsland from "@/components/NavigationIsland";
import CadastroReceitas from "@/components/receitas/CadastroReceitas";
import ListaReceitas from "@/components/receitas/ListaReceitas";

const Receitas = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20">
      <NavigationIsland />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">💰 Receitas</h1>
          <p className="text-muted-foreground">Controle todas as suas fontes de renda</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Cadastro */}
          <CadastroReceitas />
          
          {/* Lista de Receitas */}
          <ListaReceitas />
        </div>
      </div>
    </div>
  );
};

export default Receitas;
