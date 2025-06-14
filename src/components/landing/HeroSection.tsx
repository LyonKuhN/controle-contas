
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, TrendingUp, DollarSign, PieChart } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-20">
        {/* Badge de Oferta */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 text-foreground border-2 border-primary/30 px-6 py-3 rounded-full mb-8 backdrop-blur-sm">
          <Star className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold">🎉 3 DIAS GRÁTIS - Sem cartão de crédito</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6 leading-tight">
          Controle Total das Suas Finanças
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-4xl mx-auto">
          A ferramenta mais completa para gerenciar seus gastos, receitas e investimentos. 
          <span className="text-primary font-bold"> Experimente grátis por 3 dias</span> e descubra como é fácil ter controle total do seu dinheiro.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
          <Link to="/auth?mode=signup">
            <Button size="lg" className="text-base px-8 py-4 max-w-xs bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold shadow-2xl transition-all duration-300 transform hover:scale-105">
              Começar 3 Dias Grátis
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        <p className="text-sm text-muted-foreground font-medium">
          ✓ Sem compromisso • ✓ Cancele a qualquer momento
        </p>
      </div>

      {/* Preview do Sistema */}
      <div className="relative">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 border-2 border-primary/20 backdrop-blur-sm">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-foreground text-center">Veja como é simples:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card/80 backdrop-blur rounded-lg p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300">
              <div className="flex justify-center mb-4">
                <TrendingUp className="w-12 h-12 text-primary" />
              </div>
              <h4 className="font-bold mb-3 text-card-foreground text-lg text-center">Dashboard Inteligente</h4>
              <p className="text-sm text-muted-foreground text-center">Gráficos em tempo real dos seus gastos com análises detalhadas</p>
            </div>
            <div className="bg-card/80 backdrop-blur rounded-lg p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300">
              <div className="flex justify-center mb-4">
                <DollarSign className="w-12 h-12 text-primary" />
              </div>
              <h4 className="font-bold mb-3 text-card-foreground text-lg text-center">Controle de Despesas</h4>
              <p className="text-sm text-muted-foreground text-center">Categorização automática e inteligente de todos os gastos</p>
            </div>
            <div className="bg-card/80 backdrop-blur rounded-lg p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300">
              <div className="flex justify-center mb-4">
                <PieChart className="w-12 h-12 text-primary" />
              </div>
              <h4 className="font-bold mb-3 text-card-foreground text-lg text-center">Relatórios Detalhados</h4>
              <p className="text-sm text-muted-foreground text-center">Análises completas e exportáveis do seu dinheiro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
