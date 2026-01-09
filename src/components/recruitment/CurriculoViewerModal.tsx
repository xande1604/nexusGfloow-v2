import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { downloadStorageBlob } from "@/lib/storageUrls";
import { Download, Loader2 } from "lucide-react";

import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = workerSrc;

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
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);

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
        setFileBlob(null);
        setPdfDoc(null);
        return;
      }

      setLoading(true);
      try {
        const blob = await downloadStorageBlob(curriculoUrl);
        if (cancelled) return;

        setFileBlob(blob);

        const bytes = new Uint8Array(await blob.arrayBuffer());
        const doc = await getDocument({ data: bytes }).promise;
        if (cancelled) return;
        setPdfDoc(doc);
      } catch (err: any) {
        console.error("Erro ao carregar currículo:", err);
        toast({
          title: "Não foi possível carregar o currículo",
          description: "Verifique o arquivo e as permissões do Storage.",
          variant: "destructive",
        });
        setFileBlob(null);
        setPdfDoc(null);
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
    let cancelled = false;

    async function render() {
      const container = containerRef.current;
      if (!container || !open || !pdfDoc) return;

      setRendering(true);
      container.innerHTML = "";

      try {
        const total = pdfDoc.numPages || 0;
        for (let pageNum = 1; pageNum <= total; pageNum++) {
          if (cancelled) return;

          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const wrapper = document.createElement("div");
          wrapper.className = "mx-auto w-full max-w-[900px]";

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context indisponível");

          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = "100%";
          canvas.style.height = "auto";

          wrapper.appendChild(canvas);
          container.appendChild(wrapper);

          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        }
      } catch (e) {
        console.error("Erro ao renderizar PDF:", e);
        if (!cancelled) {
          toast({
            title: "Não foi possível visualizar o PDF",
            description: "A visualização foi bloqueada/limitada; use o botão Baixar.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setRendering(false);
      }
    }

    void render();

    return () => {
      cancelled = true;
    };
  }, [open, pdfDoc, toast]);

  const handleDownload = () => {
    if (!fileBlob) return;
    const url = URL.createObjectURL(fileBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle>{title}</DialogTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleDownload} disabled={!fileBlob}>
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
          {(loading || rendering) && (
            <div className="h-full w-full grid place-items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                {loading ? "Carregando PDF..." : "Renderizando páginas..."}
              </div>
            </div>
          )}

          {!loading && !rendering && !pdfDoc && (
            <div className="h-full w-full grid place-items-center">
              <p className="text-sm text-muted-foreground">Nenhum arquivo para exibir.</p>
            </div>
          )}

          <div
            ref={containerRef}
            className={"h-full w-full overflow-auto p-4 space-y-4 " + (loading || rendering ? "hidden" : "")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
