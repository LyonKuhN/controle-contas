
import { useScrollAnimation, useScrollAnimationList } from '@/hooks/useScrollAnimation';

const StatsSection = () => {
  const { ref: containerRef, isVisible: isContainerVisible } = useScrollAnimation({ threshold: 0.3 });
  const { visibleItems, setRef } = useScrollAnimationList(3, { 
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  });

  const stats = [
    { value: "10K+", label: "Usuários Ativos" },
    { value: "R$ 50M+", label: "Controlados" },
    { value: "99.9%", label: "Satisfação" }
  ];

  return (
    <div className="container mx-auto px-4 mb-20">
      <div 
        ref={containerRef as any}
        className={`bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-12 border border-primary/20 transition-all duration-700 ${
          isContainerVisible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-8 scale-95'
        }`}
      >
        <div className={`text-center mb-8 transition-all duration-500 delay-200 ${
          isContainerVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4'
        }`}>
          <h2 className="text-3xl font-bold mb-2 text-foreground">Junte-se a milhares de usuários</h2>
          <p className="text-muted-foreground">Que já transformaram sua vida financeira</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div 
              key={index}
              ref={setRef(index) as any}
              className={`transition-all duration-600 ${
                visibleItems[index]
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-6 scale-90'
              }`}
              style={{ transitionDelay: `${400 + index * 200}ms` }}
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-muted-foreground text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
