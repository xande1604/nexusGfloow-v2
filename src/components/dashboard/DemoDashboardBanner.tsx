import { Info, Upload, Download, FileSpreadsheet, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DemoDashboardBannerProps {
  onNavigateToSettings?: () => void;
}

export const DemoDashboardBanner = ({ onNavigateToSettings }: DemoDashboardBannerProps) => {
  const handleDownloadTemplate = () => {
    // URL para o modelo de planilha
    const templateUrl = 'https://docs.google.com/spreadsheets/d/1example/export?format=xlsx';
    
    // Cria um link temporário para download
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = 'modelo-importacao-gfloow.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Download iniciado!', {
      description: 'O modelo de planilha será baixado em instantes.'
    });
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-5 md:p-6 mb-6 shadow-lg">
      <div className="flex flex-col gap-4">
        {/* Header */}
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
              Estes são dados fictícios para você conhecer a plataforma. Para usar com seus próprios dados, 
              baixe nosso modelo de planilha, preencha e importe na tela de configurações.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handleDownloadTemplate}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar planilha modelo
          </Button>
          
          <Button
            variant="outline"
            onClick={onNavigateToSettings}
            className="border-amber-400 dark:border-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar meus dados
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 sm:ml-auto"
            asChild
          >
            <a href="https://docs.gfloow.com.br/importacao" target="_blank" rel="noopener noreferrer">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Ver documentação
            </a>
          </Button>
        </div>

        {/* Tips */}
        <div className="bg-white/60 dark:bg-black/20 rounded-xl p-3 mt-1">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Dica:</strong> A planilha modelo contém todas as colunas necessárias com exemplos. 
              Basta substituir os dados de exemplo pelos seus colaboradores, cargos e centros de custo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
