
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Check, Undo } from "lucide-react";
import { useReceitas } from "@/hooks/useReceitas";
import { useState } from "react";
import EditReceitaDialog from "./EditReceitaDialog";

const ListaReceitas = () => {
  const { receitas, isLoading, updateReceita, deleteReceita } = useReceitas();
  const [editingReceita, setEditingReceita] = useState<any>(null);

  console.log('ListaReceitas: Dados carregados:', { receitas, isLoading });

  const handleReceber = (id: string) => {
    console.log('Marcando como recebido:', id);
    updateReceita.mutate({
      id,
      recebido: true
    });
  };

  const desfazerRecebimento = (id: string) => {
    console.log('Desfazendo recebimento:', id);
    updateReceita.mutate({
      id,
      recebido: false
    });
  };

  const totalReceitas = receitas.reduce((total, receita) => total + receita.valor, 0);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando recebimentos...</div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recebimentos Cadastrados</h2>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-green-600">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {receitas.map((receita) => (
            <Card key={receita.id} className={`p-4 border ${receita.recebido ? 'bg-green-50 border-green-200' : 'border-border'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`font-semibold ${receita.recebido ? 'text-green-800' : 'text-foreground'}`}>
                    {receita.descricao}
                  </h3>
                  <p className={`text-sm ${receita.recebido ? 'text-green-700' : 'text-muted-foreground'}`}>
                    {receita.categoria?.nome}
                  </p>
                  {receita.tipo && (
                    <p className={`text-xs ${receita.recebido ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {receita.tipo === 'fixa' ? '🔒 Fixa' : '🔄 Variável'}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={receita.recebido ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}>
                    {receita.recebido ? 'Recebido' : 'Pendente'}
                  </Badge>
                  {!receita.recebido && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleReceber(receita.id)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-100"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  {receita.recebido && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => desfazerRecebimento(receita.id)}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                    >
                      <Undo className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingReceita(receita)}
                    className={receita.recebido 
                      ? "text-green-700 hover:text-green-800 hover:bg-green-100" 
                      : "text-foreground hover:text-foreground hover:bg-accent"
                    }
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={() => deleteReceita.mutate(receita.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className={`text-lg font-bold ${receita.recebido ? 'text-green-700' : 'text-green-600'}`}>
                    R$ {receita.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className={`text-sm ${receita.recebido ? 'text-green-600' : 'text-muted-foreground'}`}>
                    Data: {new Date(receita.data_recebimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {receitas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum recebimento cadastrado ainda.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Dialog de Edição */}
      <EditReceitaDialog 
        receita={editingReceita}
        open={!!editingReceita}
        onClose={() => setEditingReceita(null)}
      />
    </>
  );
};

export default ListaReceitas;
