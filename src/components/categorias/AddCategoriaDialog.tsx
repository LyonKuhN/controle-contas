
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddCategoriaDialogProps {
  open: boolean;
  onClose: () => void;
  tipo: 'despesa' | 'receita';
}

const AddCategoriaDialog = ({ open, onClose, tipo }: AddCategoriaDialogProps) => {
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState("#8b5cf6");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCategoria = useMutation({
    mutationFn: async (data: { nome: string; tipo: string; cor: string }) => {
      const { data: categoria, error } = await supabase
        .from('categorias')
        .insert([{
          ...data,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return categoria;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!"
      });
      setNome("");
      setCor("#8b5cf6");
      onClose();
    },
    onError: (error) => {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar categoria",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive"
      });
      return;
    }

    createCategoria.mutate({
      nome: nome.trim(),
      tipo,
      cor
    });
  };

  const cores = [
    "#8b5cf6", "#ef4444", "#22c55e", "#3b82f6", 
    "#f59e0b", "#ec4899", "#10b981", "#f97316",
    "#6366f1", "#84cc16", "#06b6d4", "#8b5cf6"
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>
            Crie uma nova categoria para {tipo === 'despesa' ? 'despesas' : 'receitas'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Categoria</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome da categoria"
              required
            />
          </div>

          <div>
            <Label htmlFor="cor">Cor</Label>
            <div className="flex gap-2 mt-2">
              {cores.map((corOption) => (
                <button
                  key={corOption}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    cor === corOption ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: corOption }}
                  onClick={() => setCor(corOption)}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createCategoria.isPending}>
              {createCategoria.isPending ? 'Criando...' : 'Criar Categoria'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoriaDialog;
