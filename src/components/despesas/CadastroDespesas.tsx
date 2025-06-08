
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDespesas } from "@/hooks/useDespesas";
import { useCategorias } from "@/hooks/useCategorias";

const CadastroDespesas = () => {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria_id: '',
    data_vencimento: '',
    tipo: 'variavel' as 'fixa' | 'variavel' | 'parcelada',
    observacoes: ''
  });

  const { createDespesa } = useDespesas();
  const { categorias } = useCategorias('despesa');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTipoChange = (value: 'fixa' | 'variavel' | 'parcelada') => {
    setFormData(prev => ({ ...prev, tipo: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.valor || !formData.categoria_id || !formData.data_vencimento) {
      return;
    }

    createDespesa.mutate({
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      categoria_id: formData.categoria_id,
      data_vencimento: formData.data_vencimento,
      tipo: formData.tipo,
      pago: false,
      observacoes: formData.observacoes || undefined
    });

    // Reset form
    setFormData({
      descricao: '',
      valor: '',
      categoria_id: '',
      data_vencimento: '',
      tipo: 'variavel',
      observacoes: ''
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Cadastrar Nova Despesa</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="descricao">Descrição *</Label>
          <Input
            id="descricao"
            value={formData.descricao}
            onChange={(e) => handleInputChange('descricao', e.target.value)}
            placeholder="Ex: Energia elétrica"
            required
          />
        </div>

        <div>
          <Label htmlFor="valor">Valor *</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            value={formData.valor}
            onChange={(e) => handleInputChange('valor', e.target.value)}
            placeholder="0,00"
            required
          />
        </div>

        <div>
          <Label htmlFor="categoria">Categoria *</Label>
          <Select value={formData.categoria_id} onValueChange={(value) => handleInputChange('categoria_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tipo">Tipo de Despesa *</Label>
          <Select value={formData.tipo} onValueChange={handleTipoChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixa">🔒 Fixa</SelectItem>
              <SelectItem value="variavel">🔄 Variável</SelectItem>
              <SelectItem value="parcelada">📅 Parcelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
          <Input
            id="data_vencimento"
            type="date"
            value={formData.data_vencimento}
            onChange={(e) => handleInputChange('data_vencimento', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Input
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            placeholder="Informações adicionais (opcional)"
          />
        </div>

        <Button type="submit" className="w-full" disabled={createDespesa.isPending}>
          {createDespesa.isPending ? 'Cadastrando...' : 'Cadastrar Despesa'}
        </Button>
      </form>
    </Card>
  );
};

export default CadastroDespesas;
