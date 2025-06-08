
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReceitas } from "@/hooks/useReceitas";
import { useCategorias } from "@/hooks/useCategorias";

interface EditReceitaDialogProps {
  receita: any;
  open: boolean;
  onClose: () => void;
}

const EditReceitaDialog = ({ receita, open, onClose }: EditReceitaDialogProps) => {
  const { updateReceita } = useReceitas();
  const { categorias } = useCategorias();
  
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria_id: '',
    data_recebimento: '',
    observacoes: '',
    tipo: 'variavel'
  });

  useEffect(() => {
    if (receita) {
      setFormData({
        descricao: receita.descricao || '',
        valor: receita.valor?.toString() || '',
        categoria_id: receita.categoria_id || '',
        data_recebimento: receita.data_recebimento || '',
        observacoes: receita.observacoes || '',
        tipo: receita.tipo || 'variavel'
      });
    }
  }, [receita]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!receita) return;

    updateReceita.mutate({
      id: receita.id,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      categoria_id: formData.categoria_id,
      data_recebimento: formData.data_recebimento,
      observacoes: formData.observacoes || null,
      tipo: formData.tipo as 'fixa' | 'variavel'
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const categoriasDisponiveis = categorias.filter(cat => cat.tipo === 'receita');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Receita</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="valor">Valor</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({...formData, valor: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={formData.categoria_id} onValueChange={(value) => setFormData({...formData, categoria_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoriasDisponiveis.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: categoria.cor }}
                      />
                      {categoria.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixa">🔒 Fixa</SelectItem>
                <SelectItem value="variavel">🔄 Variável</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data_recebimento">Data de Recebimento</Label>
            <Input
              id="data_recebimento"
              type="date"
              value={formData.data_recebimento}
              onChange={(e) => setFormData({...formData, data_recebimento: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              placeholder="Observações adicionais (opcional)"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateReceita.isPending}>
              {updateReceita.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReceitaDialog;
