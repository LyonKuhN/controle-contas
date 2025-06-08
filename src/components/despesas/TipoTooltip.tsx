
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TipoTooltip = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">🔒 Fixa:</span> Despesas que se repetem mensalmente no mesmo dia (ex: aluguel, financiamento)
            </div>
            <div>
              <span className="font-semibold">🔄 Variável:</span> Despesas esporádicas ou que variam de valor (ex: supermercado, combustível)
            </div>
            <div>
              <span className="font-semibold">📅 Parcelada:</span> Despesas divididas em parcelas com valor fixo (ex: compras no cartão)
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TipoTooltip;
