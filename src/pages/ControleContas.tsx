
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import ContasPagar from "@/components/controle-contas/ContasPagar";
import HistoricoPagamentos from "@/components/controle-contas/HistoricoPagamentos";
import NavigationIsland from "@/components/NavigationIsland";
import { useDespesas } from "@/hooks/useDespesas";
import { useReceitas } from "@/hooks/useReceitas";

const ControleContas = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { despesas, generateDespesasFixas } = useDespesas();
  const { receitas } = useReceitas();

  // Calcular saldo real baseado nas receitas recebidas e despesas pagas
  const totalReceitasRecebidas = receitas
    .filter(receita => receita.recebido)
    .reduce((total, receita) => total + receita.valor, 0);

  const totalDespesasPagas = despesas
    .filter(despesa => despesa.pago)
    .reduce((total, despesa) => total + despesa.valor, 0);

  const saldoAtual = totalReceitasRecebidas - totalDespesasPagas;

  // Filtrar despesas do mês selecionado e atrasadas
  const hoje = new Date();
  const inicioMesAtual = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const fimMesAtual = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const despesasDoMes = despesas.filter(despesa => {
    const dataVencimento = new Date(despesa.data_vencimento);
    const isCurrentMonth = dataVencimento >= inicioMesAtual && dataVencimento <= fimMesAtual;
    const isOverdue = dataVencimento < hoje && !despesa.pago && currentDate.getTime() === new Date(hoje.getFullYear(), hoje.getMonth(), 1).getTime();
    return isCurrentMonth || isOverdue;
  });

  const contasAPagar = despesasDoMes.filter(d => !d.pago);
  const contasPagas = despesasDoMes.filter(d => d.pago);

  const qtdContasTotal = despesasDoMes.length;
  const qtdContasPendentes = contasAPagar.length;
  const valorContasTotal = despesasDoMes.reduce((total, despesa) => total + despesa.valor, 0);
  const valorContasPendentes = contasAPagar.reduce((total, despesa) => total + despesa.valor, 0);

  // Verificar se existem despesas fixas modelo
  const temDespesasFixasModelo = despesas.some(despesa => despesa.tipo === 'fixa');

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleGenerateDespesasFixas = () => {
    generateDespesasFixas.mutate(currentDate);
  };

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20">
      <NavigationIsland />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">📋 Controle de Contas</h1>
          <p className="text-muted-foreground">Gerencie suas contas e acompanhe pagamentos</p>
        </div>
        
        {/* Saldo Atual Calculado Dinamicamente */}
        <Card className={`p-6 mb-8 ${saldoAtual >= 0 ? 'bg-gradient-primary' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white`}>
          <div className="text-center">
            <h2 className="text-lg font-medium mb-2">Saldo em Caixa</h2>
            <p className="text-3xl font-bold">
              R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-2 text-sm opacity-90">
              <p>Receitas Recebidas: R$ {totalReceitasRecebidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p>Despesas Pagas: R$ {totalDespesasPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </Card>

        {/* Estatísticas do Mês */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Total de Contas</p>
            <p className="text-2xl font-bold text-primary">{qtdContasTotal}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Contas Pendentes</p>
            <p className="text-2xl font-bold text-red-500">{qtdContasPendentes}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-xl font-bold text-primary">
              R$ {valorContasTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Valor Pendente</p>
            <p className="text-xl font-bold text-red-500">
              R$ {valorContasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </Card>
        </div>

        {/* Navegação de Mês e Botão Gerar Despesas Fixas */}
        <Card className="p-4 mb-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Mês Anterior
            </Button>
            
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold capitalize">
                {monthName}
              </h3>
              
              {temDespesasFixasModelo && (
                <Button
                  onClick={handleGenerateDespesasFixas}
                  disabled={generateDespesasFixas.isPending}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {generateDespesasFixas.isPending ? 'Gerando...' : 'Gerar Despesas Fixas'}
                </Button>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              Próximo Mês
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          {temDespesasFixasModelo && (
            <div className="mt-3 text-sm text-muted-foreground text-center">
              Clique em "Gerar Despesas Fixas" para criar as despesas fixas cadastradas para {monthName.toLowerCase()}
            </div>
          )}
        </Card>

        {/* Tabs para diferentes visualizações */}
        <Tabs defaultValue="contas-pagar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contas-pagar">Contas a Pagar</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Pagamentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contas-pagar" className="mt-6">
            <ContasPagar currentDate={currentDate} />
          </TabsContent>
          
          <TabsContent value="historico" className="mt-6">
            <HistoricoPagamentos />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ControleContas;
