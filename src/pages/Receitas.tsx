
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

const Receitas = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Receitas</h1>
        </div>
        
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-2xl font-bold mb-4">Controle de Receitas</h2>
          <p className="text-muted-foreground">
            Controle todas as suas fontes de renda
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Receitas;
