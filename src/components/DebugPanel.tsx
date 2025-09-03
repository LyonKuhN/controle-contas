import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStripePrice } from '@/hooks/useStripePrice';
import { supabase } from '@/integrations/supabase/client';

export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, session, subscriptionData } = useAuth();
  const { priceData, loading, error, refreshPrice } = useStripePrice();
  const [testResults, setTestResults] = useState<any>({});

  const runConnectivityTest = async () => {
    console.log('🔧 Executando teste de conectividade...');
    const results: any = {};
    
    try {
      // Teste 1: Auth session
      const sessionTest = await supabase.auth.getSession();
      results.authSession = {
        success: !sessionTest.error,
        error: sessionTest.error?.message,
        hasSession: !!sessionTest.data.session
      };
      
      // Teste 2: Simple function call
      const start = Date.now();
      const funcTest = await supabase.functions.invoke('get-stripe-price');
      results.edgeFunction = {
        success: !funcTest.error,
        error: funcTest.error?.message,
        responseTime: Date.now() - start,
        hasData: !!funcTest.data
      };
      
      // Teste 3: Database connectivity  
      const dbTest = await supabase.from('profiles').select('id').limit(1);
      results.database = {
        success: !dbTest.error,
        error: dbTest.error?.message
      };
      
    } catch (error) {
      results.generalError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    console.log('🔧 Resultados dos testes:', results);
    setTestResults(results);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="mb-2">
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            Debug Panel
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="w-96 max-h-96 overflow-y-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Sistema Debug</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              
              {/* Auth Status */}
              <div className="p-2 border rounded">
                <strong>Auth:</strong> {user ? '✅ Logado' : '❌ Não logado'}
                <br />
                <strong>Email:</strong> {user?.email || 'N/A'}
                <br />
                <strong>Session:</strong> {session ? '✅ Ativa' : '❌ Inativa'}
              </div>

              {/* Subscription Status */}
              <div className="p-2 border rounded">
                <strong>Assinatura:</strong> {subscriptionData?.subscribed ? '✅ Ativa' : '❌ Inativa'}
                <br />
                <strong>Tier:</strong> {subscriptionData?.subscription_tier || 'N/A'}
              </div>

              {/* Price Data */}
              <div className="p-2 border rounded">
                <strong>Preço:</strong> {loading ? '🔄 Carregando' : priceData ? '✅ Carregado' : '❌ Erro'}
                <br />
                <strong>Valor:</strong> {priceData?.formatted || 'N/A'}
                <br />
                <strong>Erro:</strong> {error || 'Nenhum'}
              </div>

              {/* Test Results */}
              {Object.keys(testResults).length > 0 && (
                <div className="p-2 border rounded">
                  <strong>Testes:</strong>
                  <pre className="text-xs mt-1 whitespace-pre-wrap">
                    {JSON.stringify(testResults, null, 2)}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" onClick={refreshPrice} disabled={loading}>
                  Refresh Price
                </Button>
                <Button size="sm" onClick={runConnectivityTest}>
                  Test Connectivity
                </Button>
              </div>

            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};