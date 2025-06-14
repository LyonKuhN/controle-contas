
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import NavigationIsland from "@/components/NavigationIsland";
import ThemeToggle from "@/components/ThemeToggle";
import TrialExpiredOverlay from "@/components/TrialExpiredOverlay";
import { useAuth } from "@/hooks/useAuth";
import { useDespesas } from "@/hooks/useDespesas";
import { useReceitas } from "@/hooks/useReceitas";
import { useCategorias } from "@/hooks/useCategorias";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const menuItems = [
  {
    title: "Despesas",
    description: "Registre e categorize todos os seus gastos mensais",
    icon: "💸",
    path: "/despesas"
  },
  {
    title: "Receitas",
    description: "Controle todas as suas fontes de renda",
    icon: "💰",
    path: "/receitas"
  },
  {
    title: "Controle de Contas",
    description: "Gerencie suas contas e acompanhe pagamentos",
    icon: "📋",
    path: "/controle-contas"
  }
];

const Index = () => {
  const { user } = useAuth();
  const { despesas } = useDespesas();
  const { receitas } = useReceitas();
  const { categorias } = useCategorias();

  // Calcular totais
  const totalDespesas = despesas.reduce((acc, despesa) => acc + Number(despesa.valor), 0);
  const totalReceitas = receitas.reduce((acc, receita) => acc + Number(receita.valor), 0);
  const saldoLiquido = totalReceitas - totalDespesas;

  // Despesas por categoria
  const despesasPorCategoria = despesas.reduce((acc, despesa) => {
    const categoria = categorias.find(cat => cat.id === despesa.categoria_id);
    const nomeCategoria = categoria?.nome || 'Sem categoria';
    acc[nomeCategoria] = (acc[nomeCategoria] || 0) + Number(despesa.valor);
    return acc;
  }, {} as Record<string, number>);

  const dadosPieChart = Object.entries(despesasPorCategoria).map(([nome, valor], index) => ({
    name: nome,
    value: valor,
    fill: `hsl(${index * 45}, 70%, 60%)`
  }));

  const dadosBarChart = [
    { name: 'Receitas', valor: totalReceitas, fill: '#22c55e' },
    { name: 'Despesas', valor: totalDespesas, fill: '#ef4444' },
  ];

  return (
    <div className="min-h-screen">
      <TrialExpiredOverlay />
      
      {/* Navigation Island, Theme Toggle and Profile Button */}
      <div className="container mx-auto px-4 py-6">
        <div className="relative">
          <NavigationIsland />
          
          {/* Theme Toggle and Profile Button - positioned at the same height as navigation island */}
          <div className="absolute top-0 right-0 flex items-center gap-3">
            <ThemeToggle />
            {user && (
              <Link to="/profile">
                <Button
                  variant="outline"
                  size="sm"
                  className="nav-island flex items-center gap-2 bg-transparent border-primary/20 hover:bg-primary/10"
                >
                  <User className="w-4 h-4" />
                  Perfil
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Header with Subtle Title */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img 
              src="/lovable-uploads/4fec2beb-6c7e-4cea-a53b-51b0335866ca.png" 
              alt="Logo"
              className="w-16 h-16 object-contain"
            />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              LYONPAY
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gerencie suas finanças pessoais de forma simples e eficiente
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {menuItems.map((item, index) => (
            <Link key={item.path} to={item.path} className="group">
              <Card 
                className="menu-card-hover p-8 h-72 flex flex-col justify-between cursor-pointer"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="space-y-4">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-2xl font-bold menu-text">{item.title}</h3>
                  <p className="text-sm leading-relaxed menu-description">
                    {item.description}
                  </p>
                </div>
                <div className="mt-8">
                  <span className="text-sm font-medium menu-text text-primary group-hover:text-black transition-colors duration-500">
                    Explorar →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Dashboard Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">📊 Dashboard Financeiro</h2>
            <p className="text-muted-foreground">Análise completa das suas finanças</p>
          </div>
          
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-700 mb-2">💰 Total Receitas</h3>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-200">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-700 mb-2">💸 Total Despesas</h3>
                <p className="text-2xl font-bold text-red-600">
                  R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </Card>
            
            <Card className={`p-6 ${saldoLiquido >= 0 ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200' : 'bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-200'}`}>
              <div className="text-center">
                <h3 className={`text-lg font-semibold mb-2 ${saldoLiquido >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                  📈 Saldo Líquido
                </h3>
                <p className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </Card>
          </div>

          {/* Gráficos */}
          {(dadosPieChart.length > 0 || dadosBarChart.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gráfico de Pizza - Despesas por Categoria */}
              {dadosPieChart.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-center">Despesas por Categoria</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dadosPieChart}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({name, percent}) => `${name} (${(percent * 100).toFixed(1)}%)`}
                      >
                        {dadosPieChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Gráfico de Barras - Receitas vs Despesas */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 text-center">Receitas vs Despesas</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosBarChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                    <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    <Bar dataKey="valor" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
