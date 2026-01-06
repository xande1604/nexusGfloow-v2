import { Sparkles, Eye } from 'lucide-react';

export const DemoDashboardBanner = () => {
  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-5 md:p-6 mb-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
              MODO DEMONSTRAÇÃO
            </span>
          </div>
          <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">
            Você está explorando dados de exemplo
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Estes são dados fictícios para você conhecer a plataforma. 
            Explore as funcionalidades, crie cargos, avaliações, roadmaps e testes de exemplo para entender como tudo funciona.
          </p>
          
          <div className="flex items-center gap-2 mt-3 text-xs text-amber-600 dark:text-amber-400">
            <Eye className="w-4 h-4" />
            <span>Para usar com seus próprios dados, solicite uma chave de acesso.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
