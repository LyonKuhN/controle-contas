
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-5xl mx-auto mb-20">
        {/* Badge de Oferta */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30 px-6 py-2 rounded-full mb-8">
          <Star className="w-4 h-4" />
          <span className="text-sm font-semibold">🎉 3 DIAS GRÁTIS - Sem cartão de crédito</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6 leading-tight">
          Controle Total das Suas Finanças
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
          A ferramenta mais completa para gerenciar seus gastos, receitas e investimentos. 
          <span className="text-primary font-semibold"> Experimente grátis por 3 dias</span> e descubra como é fácil ter controle total do seu dinheiro.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Link to="/auth?mode=signup">
            <Button size="lg" className="text-lg px-12 py-6 min-w-[250px] bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-black font-bold shadow-xl">
              Começar 3 Dias Grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          
          <p className="text-sm text-muted-foreground">
            ✓ Sem compromisso • ✓ Cancele a qualquer momento
          </p>
        </div>

        {/* Preview do Sistema */}
        <div className="relative">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-6 text-white">Veja como é simples:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card/50 backdrop-blur rounded-lg p-6 border border-primary/10">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="font-semibold mb-2">Dashboard Inteligente</h4>
                <p className="text-sm text-muted-foreground">Gráficos em tempo real dos seus gastos</p>
              </div>
              <div className="bg-card/50 backdrop-blur rounded-lg p-6 border border-primary/10">
                <div className="text-3xl mb-3">💸</div>
                <h4 className="font-semibold mb-2">Controle de Despesas</h4>
                <p className="text-sm text-muted-foreground">Categorização automática e inteligente</p>
              </div>
              <div className="bg-card/50 backdrop-blur rounded-lg p-6 border border-primary/10">
                <div className="text-3xl mb-3">📋</div>
                <h4 className="font-semibold mb-2">Relatórios Detalhados</h4>
                <p className="text-sm text-muted-foreground">Análises completas do seu dinheiro</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
