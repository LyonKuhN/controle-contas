
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContasPagar from "@/components/controle-contas/ContasPagar";
import HistoricoPagamentos from "@/components/controle-contas/HistoricoPagamentos";
import NavigationIsland from "@/components/NavigationIsland";
import { useDespesas } from "@/hooks/useDespesas";
import { useReceitas } from "@/hooks/useReceitas";

const ControleContas = () => {
  const { despesas } = useDespesas();
  const { receitas } = useReceitas();

  // Calcular saldo real baseado nas receitas recebidas e despesas pagas
  const totalReceitasRecebidas = receitas
    .filter(receita => receita.recebido)
    .reduce((total, receita) => total + receita.valor, 0);

  const totalDespesasPagas = despesas
    .filter(despesa => despesa.pago)
    .reduce((total, despesa) => total + despesa.valor, 0);

  const saldoAtual = totalReceitasRecebidas - totalDespesasPagas;

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

        {/* Tabs para diferentes visualizações */}
        <Tabs defaultValue="contas-pagar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contas-pagar">Contas a Pagar</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Pagamentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contas-pagar" className="mt-6">
            <ContasPagar />
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
