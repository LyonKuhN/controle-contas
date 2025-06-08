
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContasPagar from "@/components/controle-contas/ContasPagar";
import HistoricoPagamentos from "@/components/controle-contas/HistoricoPagamentos";

const ControleContas = () => {
  const [saldoAtual] = useState(5420.50);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Controle de Contas</h1>
        </div>
        
        {/* Saldo Atual */}
        <Card className="p-6 mb-8 bg-gradient-primary text-white">
          <div className="text-center">
            <h2 className="text-lg font-medium mb-2">Saldo em Caixa</h2>
            <p className="text-3xl font-bold">
              R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
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
