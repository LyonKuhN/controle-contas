
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import CadastroDespesas from "@/components/despesas/CadastroDespesas";
import ListaDespesas from "@/components/despesas/ListaDespesas";
import NavigationIsland from "@/components/NavigationIsland";

const Despesas = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavigationIsland />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Despesas</h1>
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
