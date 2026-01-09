import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getStorageBlobUrl } from "@/lib/storageUrls";
import { Download, Loader2 } from "lucide-react";

interface CurriculoViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  curriculoUrl?: string;
  title?: string;
}

export function CurriculoViewerModal({
  open,
  onOpenChange,
  curriculoUrl,
  title = "Currículo",
}: CurriculoViewerModalProps) {
  const { toast } = useToast();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileName = useMemo(() => {
    if (!curriculoUrl) return "curriculo.pdf";
    try {
      const u = new URL(curriculoUrl);
      const last = u.pathname.split("/").filter(Boolean).pop();
      return last && last.includes(".pdf") ? last : "curriculo.pdf";
    } catch {
      return "curriculo.pdf";
    }
  }, [curriculoUrl]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!open || !curriculoUrl) {
        setBlobUrl(null);
        return;
      }

      setLoading(true);
      try {
        const url = await getStorageBlobUrl(curriculoUrl);
        if (cancelled) return;
        setBlobUrl(url);
      } catch (err: any) {
        console.error("Erro ao carregar currículo:", err);
        toast({
          title: "Não foi possível carregar o currículo",
          description: "Verifique o arquivo e as permissões do Storage.",
          variant: "destructive",
        });
        setBlobUrl(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, curriculoUrl, toast]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle>{title}</DialogTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleDownload} disabled={!blobUrl}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 rounded-md border bg-background overflow-hidden">
          {loading && (
            <div className="h-full w-full grid place-items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando PDF...
              </div>
            </div>
          )}

          {!loading && blobUrl && (
            <iframe
              title={title}
              src={blobUrl}
              className="w-full h-full"
            />
          )}

          {!loading && !blobUrl && (
            <div className="h-full w-full grid place-items-center">
              <p className="text-sm text-muted-foreground">Nenhum arquivo para exibir.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
