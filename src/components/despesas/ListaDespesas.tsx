
import { Card } from "@/components/ui/card";
import { useDespesas } from "@/hooks/useDespesas";
import { useState } from "react";
import TipoTooltip from "./TipoTooltip";
import EditDespesaDialog from "../controle-contas/EditDespesaDialog";
import DespesaGroup from "./DespesaGroup";

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

  // Agrupar despesas por descrição e categoria
  const groupedDespesas = despesas.reduce((groups, despesa) => {
    const key = `${despesa.descricao}-${despesa.categoria_id}-${despesa.tipo}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(despesa);
    return groups;
  }, {} as Record<string, typeof despesas>);

  // Ordenar cada grupo por data de vencimento
  Object.keys(groupedDespesas).forEach(key => {
    groupedDespesas[key].sort((a, b) => 
      new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime()
    );
  });

  // Ordenar grupos pela data de vencimento da primeira despesa de cada grupo
  const sortedGroups = Object.entries(groupedDespesas).sort(([, a], [, b]) => 
    new Date(a[0].data_vencimento).getTime() - new Date(b[0].data_vencimento).getTime()
  );

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
          {sortedGroups.map(([groupKey, groupDespesas]) => (
            <DespesaGroup
              key={groupKey}
              despesas={groupDespesas}
              onPagar={handlePagar}
              onDesfazerPagamento={desfazerPagamento}
              onEdit={setEditingDespesa}
              onDelete={(id) => deleteDespesa.mutate(id)}
            />
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
