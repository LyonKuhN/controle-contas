import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, TrendingUp, TrendingDown, Minus } from "lucide-react";
import NavigationIsland from "@/components/NavigationIsland";
import ThemeToggle from "@/components/ThemeToggle";
import SupportDialog from "@/components/SupportDialog";
import TrialExpiredOverlay from "@/components/TrialExpiredOverlay";
import TrialNotification from "@/components/TrialNotification";
import { useAuth } from "@/hooks/useAuth";
import { useComparativeData } from "@/hooks/useComparativeData";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

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
  const data = useComparativeData();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getChangeColor = (change: number, isGoodWhenPositive: boolean = true) => {
    if (change === 0) return "text-gray-600";
    if (isGoodWhenPositive) {
      return change > 0 ? "text-green-600" : "text-red-600";
    } else {
      return change > 0 ? "text-red-600" : "text-green-600";
    }
  };

  return (
    <div className="min-h-screen">
      <TrialExpiredOverlay />
      
      {/* Navigation Island, Theme Toggle and Profile Button */}
      <div className="container mx-auto px-4 py-6">
        <div className="relative">
          <NavigationIsland />
          
          {/* Theme Toggle, Support and Profile Button - positioned at the same height as navigation island */}
          <div className="absolute top-0 right-0 flex items-center gap-3">
            <SupportDialog variant="outline" size="sm" />
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

        {/* Trial Notification */}
        <TrialNotification />

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
            <p className="text-muted-foreground">Análise completa das suas finanças com comparativo mensal</p>
          </div>

          {/* Resumo Atual vs Anterior */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-green-700">💰 Receitas</h3>
                  <div className="flex items-center gap-1">
                    {getChangeIcon(data.changes.receitas)}
                    <span className={`text-xs font-medium ${getChangeColor(data.changes.receitas)}`}>
                      {formatPercentage(data.changes.receitas)}
                    </span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  R$ {formatCurrency(data.current.receitas)}
                </p>
                <p className="text-xs text-green-600/70">
                  {data.last.monthName}: R$ {formatCurrency(data.last.receitas)}
                </p>
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-red-700">💸 Despesas</h3>
                  <div className="flex items-center gap-1">
                    {getChangeIcon(data.changes.despesas)}
                    <span className={`text-xs font-medium ${getChangeColor(data.changes.despesas, false)}`}>
                      {formatPercentage(data.changes.despesas)}
                    </span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  R$ {formatCurrency(data.current.despesas)}
                </p>
                <p className="text-xs text-red-600/70">
                  {data.last.monthName}: R$ {formatCurrency(data.last.despesas)}
                </p>
              </div>
            </Card>
            
            <Card className={`p-6 ${data.current.saldo >= 0 ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200' : 'bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-200'}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${data.current.saldo >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    📈 Saldo Líquido
                  </h3>
                  <div className="flex items-center gap-1">
                    {getChangeIcon(data.changes.saldo)}
                    <span className={`text-xs font-medium ${getChangeColor(data.changes.saldo)}`}>
                      {formatPercentage(data.changes.saldo)}
                    </span>
                  </div>
                </div>
                <p className={`text-2xl font-bold ${data.current.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  R$ {formatCurrency(data.current.saldo)}
                </p>
                <p className={`text-xs ${data.current.saldo >= 0 ? 'text-blue-600/70' : 'text-red-600/70'}`}>
                  {data.last.monthName}: R$ {formatCurrency(data.last.saldo)}
                </p>
              </div>
            </Card>
          </div>

          {/* Gráficos */}
          {(data.charts.pieChart.length > 0 || data.charts.barChart.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gráfico de Pizza - Despesas por Categoria */}
              {data.charts.pieChart.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-center">Despesas por Categoria - {data.current.monthName}</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.charts.pieChart}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({name, percent}) => `${name} (${(percent * 100).toFixed(1)}%)`}
                      >
                        {data.charts.pieChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `R$ ${formatCurrency(Number(value))}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Gráfico de Comparação Mensal */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 text-center">Comparativo Mensal</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.charts.comparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => `R$ ${formatCurrency(Number(value))}`} />
                    <Line type="monotone" dataKey="receitas" stroke="#22c55e" strokeWidth={2} name="Receitas" />
                    <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} name="Despesas" />
                    <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={2} name="Saldo" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

          {/* Resumo de Performance */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 text-center">Resumo de Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className={`text-2xl font-bold ${getChangeColor(data.changes.receitas)}`}>
                  {formatPercentage(data.changes.receitas)}
                </div>
                <p className="text-sm text-muted-foreground">Variação em Receitas</p>
                <p className="text-xs text-muted-foreground">{data.last.monthName} → {data.current.monthName}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className={`text-2xl font-bold ${getChangeColor(data.changes.despesas, false)}`}>
                  {formatPercentage(data.changes.despesas)}
                </div>
                <p className="text-sm text-muted-foreground">Variação em Despesas</p>
                <p className="text-xs text-muted-foreground">{data.last.monthName} → {data.current.monthName}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className={`text-2xl font-bold ${getChangeColor(data.changes.saldo)}`}>
                  {formatPercentage(data.changes.saldo)}
                </div>
                <p className="text-sm text-muted-foreground">Variação no Saldo</p>
                <p className="text-xs text-muted-foreground">{data.last.monthName} → {data.current.monthName}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
