
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import { useScrollAnimation, useScrollAnimationList } from '@/hooks/useScrollAnimation';

const HeroSection = () => {
  const { ref: previewRef, isVisible: isPreviewVisible } = useScrollAnimation({ threshold: 0.2 });
  const { visibleItems, setRef } = useScrollAnimationList(3, { threshold: 0.3 });

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-20 animate-fade-in">
        {/* Badge de Oferta */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/50 dark:to-blue-950/50 text-foreground border border-emerald-200 dark:border-emerald-800 px-6 py-3 rounded-full mb-8 backdrop-blur-sm shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold">Teste Gratuito de 3 Dias • Sem Cartão de Crédito</span>
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
      <div 
        ref={previewRef as any}
        className={`relative transition-all duration-700 ${
          isPreviewVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 border-2 border-primary/20 backdrop-blur-sm">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-foreground text-center">Veja como é simples:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: "Dashboard Inteligente", desc: "Gráficos em tempo real dos seus gastos com análises detalhadas" },
              { icon: DollarSign, title: "Controle de Despesas", desc: "Categorização automática e inteligente de todos os gastos" },
              { icon: PieChart, title: "Relatórios Detalhados", desc: "Análises completas e exportáveis do seu dinheiro" }
            ].map((feature, index) => (
              <div 
                key={index}
                ref={setRef(index) as any}
                className={`bg-card/80 backdrop-blur rounded-lg p-6 border border-primary/20 hover:border-primary/40 transition-all duration-700 ${
                  visibleItems[index]
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-6 scale-95'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="flex justify-center mb-4">
                  <feature.icon className="w-12 h-12 text-primary" />
                </div>
                <h4 className="font-bold mb-3 text-card-foreground text-lg text-center">{feature.title}</h4>
                <p className="text-sm text-muted-foreground text-center">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
