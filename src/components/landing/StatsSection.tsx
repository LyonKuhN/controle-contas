
const StatsSection = () => {
  return (
    <div className="container mx-auto px-4 mb-20">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-12 border border-primary/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-white dark:text-white light:text-gray-800">Junte-se a milhares de usuários</h2>
          <p className="text-muted-foreground dark:text-gray-300 light:text-gray-600">Que já transformaram sua vida financeira</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10K+</div>
            <div className="text-muted-foreground dark:text-gray-300 light:text-gray-600 text-lg">Usuários Ativos</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">R$ 50M+</div>
            <div className="text-muted-foreground dark:text-gray-300 light:text-gray-600 text-lg">Controlados</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">99.9%</div>
            <div className="text-muted-foreground dark:text-gray-300 light:text-gray-600 text-lg">Satisfação</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
