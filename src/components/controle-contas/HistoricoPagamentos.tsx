
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDespesas } from "@/hooks/useDespesas";
import { Filter, X } from "lucide-react";

const HistoricoPagamentos = () => {
  const { despesas, isLoading } = useDespesas();
  const [filtros, setFiltros] = useState({
    categoria: "",
    tipo: "",
    valorMin: "",
    valorMax: ""
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando histórico...</div>
      </Card>
    );
  }

  // Filtrar apenas despesas pagas dos últimos 3 meses
  const hoje = new Date();
  const tresMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
  
  let despesasFiltradas = despesas.filter(despesa => 
    despesa.pago && 
    despesa.data_pagamento && 
    new Date(despesa.data_pagamento) >= tresMesesAtras
  );

  // Aplicar filtros
  if (filtros.categoria) {
    despesasFiltradas = despesasFiltradas.filter(despesa => 
      despesa.categoria?.nome.toLowerCase().includes(filtros.categoria.toLowerCase())
    );
  }

  if (filtros.tipo) {
    despesasFiltradas = despesasFiltradas.filter(despesa => 
      despesa.tipo === filtros.tipo
    );
  }

  if (filtros.valorMin) {
    despesasFiltradas = despesasFiltradas.filter(despesa => 
      despesa.valor >= parseFloat(filtros.valorMin)
    );
  }

  if (filtros.valorMax) {
    despesasFiltradas = despesasFiltradas.filter(despesa => 
      despesa.valor <= parseFloat(filtros.valorMax)
    );
  }

  // Ordenar por data de pagamento (mais recente primeiro)
  despesasFiltradas.sort((a, b) => {
    if (!a.data_pagamento || !b.data_pagamento) return 0;
    return new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime();
  });

  const limparFiltros = () => {
    setFiltros({
      categoria: "",
      tipo: "",
      valorMin: "",
      valorMax: ""
    });
  };

  const getTipoColor = (tipo: string) => {
    switch(tipo) {
      case 'fixa': return 'bg-blue-500';
      case 'variavel': return 'bg-green-500';
      case 'parcelada': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch(tipo) {
      case 'fixa': return 'Fixa';
      case 'variavel': return 'Variável';
      case 'parcelada': return 'Parcelada';
      default: return tipo;
    }
  };

  const totalPago = despesasFiltradas.reduce((total, despesa) => total + despesa.valor, 0);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Filtros</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
        </div>

        {mostrarFiltros && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Categoria</label>
              <Input
                placeholder="Buscar categoria..."
                value={filtros.categoria}
                onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Tipo</label>
              <Select value={filtros.tipo} onValueChange={(value) => setFiltros({...filtros, tipo: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="fixa">Fixa</SelectItem>
                  <SelectItem value="variavel">Variável</SelectItem>
                  <SelectItem value="parcelada">Parcelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Valor Mínimo</label>
              <Input
                type="number"
                placeholder="R$ 0,00"
                value={filtros.valorMin}
                onChange={(e) => setFiltros({...filtros, valorMin: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Valor Máximo</label>
              <Input
                type="number"
                placeholder="R$ 9999,99"
                value={filtros.valorMax}
                onChange={(e) => setFiltros({...filtros, valorMax: e.target.value})}
              />
            </div>
          </div>
        )}

        {(filtros.categoria || filtros.tipo || filtros.valorMin || filtros.valorMax) && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtros ativos:</span>
            <Button variant="outline" size="sm" onClick={limparFiltros}>
              <X className="w-4 h-4 mr-1" />
              Limpar Filtros
            </Button>
          </div>
        )}
      </Card>

      {/* Resumo */}
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Total Filtrado</h3>
          <p className="text-2xl font-bold text-primary">
            R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {despesasFiltradas.length} pagamento(s) encontrado(s)
          </p>
        </div>
      </Card>

      {/* Lista do Histórico */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Histórico de Pagamentos</h2>
        <div className="space-y-4">
          {despesasFiltradas.map((despesa) => (
            <Card key={despesa.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{despesa.descricao}</h3>
                  <p className="text-sm text-muted-foreground">{despesa.categoria?.nome}</p>
                  {despesa.tipo === 'parcelada' && (
                    <p className="text-xs text-muted-foreground">
                      Parcela {despesa.parcela_atual} de {despesa.numero_parcelas}
                    </p>
                  )}
                </div>
                <Badge className={`${getTipoColor(despesa.tipo || 'variavel')} text-white`}>
                  {getTipoLabel(despesa.tipo || 'variavel')}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-primary">
                  R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                {despesa.data_pagamento && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(despesa.data_pagamento).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </Card>
          ))}

          {despesasFiltradas.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {(filtros.categoria || filtros.tipo || filtros.valorMin || filtros.valorMax) 
                  ? "Nenhum pagamento encontrado com os filtros aplicados." 
                  : "Nenhum pagamento registrado nos últimos 3 meses."
                }
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricoPagamentos;
