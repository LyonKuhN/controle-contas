
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Check, Undo } from "lucide-react";
import { useDespesas } from "@/hooks/useDespesas";
import { useState } from "react";
import TipoTooltip from "./TipoTooltip";
import EditDespesaDialog from "../controle-contas/EditDespesaDialog";

const ListaDespesas = () => {
  const { despesas, isLoading, updateDespesa, deleteDespesa } = useDespesas();
  const [editingDespesa, setEditingDespesa] = useState<any>(null);

  const handlePagar = (id: string) => {
    updateDespesa.mutate({
      id,
      pago: true,
      data_pagamento: new Date().toISOString().split('T')[0]
    });
  };

  const desfazerPagamento = (id: string) => {
    updateDespesa.mutate({
      id,
      pago: false,
      data_pagamento: null
    });
  };

  const totalDespesas = despesas.reduce((total, despesa) => total + despesa.valor, 0);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando despesas...</div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Despesas Cadastradas</h2>
            <TipoTooltip />
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-primary">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {despesas.map((despesa) => (
            <Card key={despesa.id} className={`p-4 border ${despesa.pago ? 'bg-green-50 border-green-200' : 'border-border'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`font-semibold ${despesa.pago ? 'text-green-800' : 'text-foreground'}`}>
                    {despesa.descricao}
                  </h3>
                  <p className={`text-sm ${despesa.pago ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {despesa.categoria?.nome}
                  </p>
                  {despesa.tipo === 'parcelada' && (
                    <p className={`text-xs ${despesa.pago ? 'text-green-600' : 'text-muted-foreground'}`}>
                      Parcela {despesa.parcela_atual} de {despesa.numero_parcelas}
                      {despesa.valor_total && (
                        <> • Total: R$ {despesa.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={despesa.pago ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                    {despesa.pago ? 'Pago' : 'Pendente'}
                  </Badge>
                  <Badge variant="outline">
                    {despesa.tipo === 'fixa' && '🔒 Fixa'}
                    {despesa.tipo === 'variavel' && '🔄 Variável'}
                    {despesa.tipo === 'parcelada' && '📅 Parcelada'}
                  </Badge>
                  {!despesa.pago && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handlePagar(despesa.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  {despesa.pago && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => desfazerPagamento(despesa.id)}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <Undo className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingDespesa(despesa)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => deleteDespesa.mutate(despesa.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className={`text-lg font-bold ${despesa.pago ? 'text-green-700' : 'text-primary'}`}>
                    R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    {despesa.tipo === 'parcelada' && <span className="text-sm font-normal text-muted-foreground"> /parcela</span>}
                  </p>
                  <p className={`text-sm ${despesa.pago ? 'text-green-600' : 'text-muted-foreground'}`}>
                    Vencimento: {new Date(despesa.data_vencimento).toLocaleDateString('pt-BR')}
                  </p>
                  {despesa.pago && despesa.data_pagamento && (
                    <p className="text-sm text-green-600">
                      Pago em: {new Date(despesa.data_pagamento).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {despesas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma despesa cadastrada ainda.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Dialog de Edição */}
      <EditDespesaDialog 
        despesa={editingDespesa}
        open={!!editingDespesa}
        onClose={() => setEditingDespesa(null)}
      />
    </>
  );
};

export default ListaDespesas;
