import { Info, Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DemoDashboardBannerProps {
  onNavigateToSettings?: () => void;
}

export const DemoDashboardBanner = ({ onNavigateToSettings }: DemoDashboardBannerProps) => {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 md:p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <Info className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-1">
            Você está visualizando dados de demonstração
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Estes são dados fictícios para você explorar as funcionalidades da plataforma. 
            Para começar a usar com seus próprios dados, importe sua base de colaboradores.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToSettings}
            className="border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar dados
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
            asChild
          >
            <a href="https://docs.gfloow.com.br/importacao" target="_blank" rel="noopener noreferrer">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Ver modelo de planilha
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
