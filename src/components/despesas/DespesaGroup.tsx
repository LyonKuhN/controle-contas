
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Check, Undo, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Despesa } from "@/hooks/useDespesas";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DespesaGroupProps {
  despesas: Despesa[];
  onPagar: (id: string) => void;
  onDesfazerPagamento: (id: string) => void;
  onEdit: (despesa: Despesa) => void;
  onDelete: (id: string) => void;
}

const DespesaGroup = ({ despesas, onPagar, onDesfazerPagamento, onEdit, onDelete }: DespesaGroupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (despesas.length === 0) return null;
  
  const mainDespesa = despesas[0];
  const remainingDespesas = despesas.slice(1);
  const totalValue = despesas.reduce((sum, d) => sum + d.valor, 0);
  const paidCount = despesas.filter(d => d.pago).length;
  const totalCount = despesas.length;
  
  const renderDespesaCard = (despesa: Despesa, isMain = false) => (
    <Card 
      key={despesa.id} 
      className={`p-4 border ${despesa.pago ? 'bg-green-50 border-green-200' : 'border-border'} ${!isMain ? 'ml-4' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className={`font-semibold ${despesa.pago ? 'text-green-800' : 'text-foreground'}`}>
            {despesa.descricao}
            {isMain && totalCount > 1 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({totalCount} despesas)
              </span>
            )}
          </h3>
          <p className={`text-sm ${despesa.pago ? 'text-green-700' : 'text-muted-foreground'}`}>
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
          <Badge 
            variant="outline" 
            className={despesa.pago 
              ? 'border-green-600 text-green-800 bg-green-100' 
              : 'border-border text-foreground'
            }
          >
            {despesa.tipo === 'fixa' && '🔒 Fixa'}
            {despesa.tipo === 'variavel' && '🔄 Variável'}
            {despesa.tipo === 'parcelada' && '📅 Parcelada'}
          </Badge>
          {!despesa.pago && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onPagar(despesa.id)}
              className="text-green-600 hover:text-green-700 hover:bg-green-100"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
          {despesa.pago && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDesfazerPagamento(despesa.id)}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
            >
              <Undo className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(despesa)}
            className={despesa.pago 
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
            onClick={() => onDelete(despesa.id)}
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
            {isMain && totalCount > 1 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (Total: R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
              </span>
            )}
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
  );

  if (totalCount === 1) {
    return renderDespesaCard(mainDespesa, true);
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-2">
        <div className="relative">
          {renderDespesaCard(mainDespesa, true)}
          
          {totalCount > 1 && (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border"
              >
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className="ml-1 text-xs">
                  {paidCount}/{totalCount} pagas
                </span>
              </Button>
            </CollapsibleTrigger>
          )}
        </div>
        
        <CollapsibleContent className="space-y-2">
          {remainingDespesas.map(despesa => renderDespesaCard(despesa))}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default DespesaGroup;
