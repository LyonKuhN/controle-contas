
import { CheckCircle } from 'lucide-react';
import { useScrollAnimation, useScrollAnimationList } from '@/hooks/useScrollAnimation';

const BenefitsList = () => {
  const benefits = [
    "Dashboard completo com gráficos em tempo real",
    "Controle total de despesas e receitas",
    "Categorização automática inteligente",
    "Relatórios detalhados e exportáveis",
    "Lembretes de pagamentos automáticos",
    "Interface responsiva para todos os dispositivos"
  ];

  const { ref: titleRef, isVisible: isTitleVisible } = useScrollAnimation({ threshold: 0.2 });
  const { visibleItems, setRef } = useScrollAnimationList(benefits.length, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  return (
    <div className="container mx-auto px-4 mb-20">
      <div 
        ref={titleRef as any}
        className={`text-center mb-12 transition-all duration-700 ${
          isTitleVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Tudo que você precisa para <span className="text-primary">organizar suas finanças</span>
        </h2>
        <p className="text-xl text-muted-foreground">
          Recursos profissionais que fazem a diferença no seu dia a dia
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {benefits.map((benefit, index) => (
          <div 
            key={index} 
            ref={setRef(index) as any}
            className={`flex items-center gap-3 p-4 bg-card/50 rounded-lg border border-primary/10 transition-all duration-500 ${
              visibleItems[index]
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-6 scale-95'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-card-foreground">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenefitsList;
