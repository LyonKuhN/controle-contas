
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import { useDespesas } from "@/hooks/useDespesas";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DespesaModelo {
  id: string;
  descricao: string;
  valor: number;
  categoria_id: string;
  data_vencimento: string;
  observacoes?: string;
  categoria?: {
    nome: string;
    cor: string;
  };
}

const ModelosDespesas = () => {
  const [editingModelo, setEditingModelo] = useState<DespesaModelo | null>(null);
  const [editForm, setEditForm] = useState({
    dia_vencimento: '',
    valor: ''
  });
  const [showModelos, setShowModelos] = useState(false);

  const { updateDespesa, deleteDespesa } = useDespesas();

  // Buscar apenas modelos de despesas fixas
  const { data: modelos = [], isLoading, refetch } = useQuery({
    queryKey: ['despesas-modelos'],
    queryFn: async () => {
      console.log('Buscando modelos de despesas fixas...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('despesas')
        .select(`
          *,
          categoria:categorias(nome, cor)
        `)
        .eq('tipo', 'fixa')
        .eq('is_modelo', true)
        .eq('user_id', user.id)
        .order('descricao', { ascending: true });

      if (error) {
        console.error('Erro ao buscar modelos:', error);
        throw error;
      }
      console.log('Modelos carregados:', data);
      return data as DespesaModelo[];
    }
  });

  const handleEdit = (modelo: DespesaModelo) => {
    // Extrair o dia da data de vencimento (formato: 1900-01-DD)
    const dia = modelo.data_vencimento.split('-')[2];
    setEditForm({
      dia_vencimento: dia,
      valor: modelo.valor.toString()
    });
    setEditingModelo(modelo);
  };

  const handleSaveEdit = async () => {
    if (!editingModelo) return;

    try {
      const diaVencimento = parseInt(editForm.dia_vencimento);
      const novaDataVencimento = `1900-01-${String(diaVencimento).padStart(2, '0')}`;

      await updateDespesa.mutateAsync({
        id: editingModelo.id,
        data_vencimento: novaDataVencimento,
        valor: parseFloat(editForm.valor)
      });

      setEditingModelo(null);
      refetch();
    } catch (error) {
      console.error('Erro ao atualizar modelo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita.')) {
      await deleteDespesa.mutateAsync(id);
      refetch();
    }
  };

  const getDiaVencimento = (dataVencimento: string) => {
    return parseInt(dataVencimento.split('-')[2]);
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Carregando modelos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Dialog open={showModelos} onOpenChange={setShowModelos}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            Ver Modelos de Despesas Fixas ({modelos.length})
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modelos de Despesas Fixas</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {modelos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhum modelo de despesa fixa cadastrado ainda.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Cadastre despesas do tipo "Fixa (modelo)" para vê-las aqui.
                </p>
              </div>
            ) : (
              modelos.map((modelo) => (
                <Card key={modelo.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{modelo.descricao}</h3>
                      <p className="text-sm text-muted-foreground">{modelo.categoria?.nome}</p>
                      {modelo.observacoes && (
                        <p className="text-sm text-gray-600 mt-1">{modelo.observacoes}</p>
                      )}
                    </div>
                    <Badge 
                      className="bg-blue-500 text-white"
                    >
                      Modelo Fixo
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-primary">
                        R$ {modelo.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: Dia {getDiaVencimento(modelo.data_vencimento)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(modelo)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(modelo.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={!!editingModelo} onOpenChange={() => setEditingModelo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Modelo: {editingModelo?.descricao}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="dia_vencimento">Dia do Vencimento</Label>
              <Input
                id="dia_vencimento"
                type="number"
                min="1"
                max="31"
                value={editForm.dia_vencimento}
                onChange={(e) => setEditForm(prev => ({ ...prev, dia_vencimento: e.target.value }))}
                placeholder="Ex: 15"
              />
            </div>
            
            <div>
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={editForm.valor}
                onChange={(e) => setEditForm(prev => ({ ...prev, valor: e.target.value }))}
                placeholder="0,00"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setEditingModelo(null)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={updateDespesa.isPending}
              >
                {updateDespesa.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelosDespesas;
