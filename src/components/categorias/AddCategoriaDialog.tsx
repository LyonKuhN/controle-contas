
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
      cor: "#8b5cf6" // Cor padrão fixa
    });
  };

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
