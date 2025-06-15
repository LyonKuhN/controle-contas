
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, CalendarDays, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useReceitas } from '@/hooks/useReceitas';
import EditReceitaDialog from './EditReceitaDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ListaReceitas = () => {
  const { receitas, isLoading, error, updateReceita, deleteReceita } = useReceitas();
  const [editingReceita, setEditingReceita] = useState(null);

  console.log('ListaReceitas: Renderizando com:', {
    receitasCount: receitas?.length || 0,
    isLoading,
    hasError: !!error,
    errorMessage: error?.message
  });

  const handleRecebidoChange = (receitaId: string, recebido: boolean) => {
    console.log('ListaReceitas: Alterando status de recebimento:', { receitaId, recebido });
    updateReceita.mutate({ id: receitaId, recebido });
  };

  const handleDelete = (receitaId: string) => {
    console.log('ListaReceitas: Deletando recebimento:', receitaId);
    if (confirm('Tem certeza que deseja excluir este recebimento?')) {
      deleteReceita.mutate(receitaId);
    }
  };

  if (isLoading) {
    console.log('ListaReceitas: Mostrando skeleton de carregamento');
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Recebimentos Cadastrados</h2>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('ListaReceitas: Mostrando erro:', error);
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Recebimentos Cadastrados</h2>
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar recebimentos: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!receitas || receitas.length === 0) {
    console.log('ListaReceitas: Nenhum recebimento encontrado');
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Recebimentos Cadastrados</h2>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum recebimento cadastrado ainda.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Use o formulário acima para cadastrar seu primeiro recebimento.
          </p>
        </Card>
      </div>
    );
  }

  console.log('ListaReceitas: Renderizando lista com', receitas.length, 'recebimentos');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        Recebimentos Cadastrados ({receitas.length})
      </h2>
      
      {receitas.map((receita) => (
        <Card key={receita.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Checkbox
                checked={receita.recebido}
                onCheckedChange={(checked) => 
                  handleRecebidoChange(receita.id, checked as boolean)
                }
                className="mt-1"
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className={`font-medium ${receita.recebido ? 'line-through text-muted-foreground' : ''}`}>
                    {receita.descricao}
                  </h3>
                  {receita.categoria && (
                    <Badge 
                      variant="outline" 
                      style={{ 
                        borderColor: receita.categoria.cor,
                        color: receita.categoria.cor 
                      }}
                    >
                      {receita.categoria.nome}
                    </Badge>
                  )}
                  {receita.recebido && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Recebido
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">
                      R$ {receita.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    <span>
                      {format(new Date(receita.data_recebimento), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                </div>
                
                {receita.observacoes && (
                  <p className="text-sm text-muted-foreground">
                    {receita.observacoes}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingReceita(receita)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(receita.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
      
      {editingReceita && (
        <EditReceitaDialog
          receita={editingReceita}
          open={!!editingReceita}
          onOpenChange={(open) => !open && setEditingReceita(null)}
        />
      )}
    </div>
  );
};

export default ListaReceitas;
