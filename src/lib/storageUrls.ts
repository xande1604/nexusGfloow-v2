import { supabase } from "@/integrations/supabase/client";

export function parseSupabaseStorageUrl(
  urlStr: string
): { bucket: string; path: string; access: "public" | "sign" } | null {
  try {
    const u = new URL(urlStr);
    const parts = u.pathname.split("/").filter(Boolean);
    // /storage/v1/object/<public|sign>/<bucket>/<path>
    const objectIdx = parts.indexOf("object");
    if (objectIdx === -1) return null;

    const access = parts[objectIdx + 1];
    if (access !== "public" && access !== "sign") return null;

    const bucket = parts[objectIdx + 2];
    const path = parts.slice(objectIdx + 3).join("/");
    if (!bucket || !path) return null;

    return { bucket, path: decodeURIComponent(path), access };
  } catch {
    return null;
  }
}

/**
 * Gera uma URL assinada para abrir arquivos em buckets privados.
 * Se não conseguir, retorna a URL original.
 */
export async function getStorageViewUrl(
  urlStr: string,
  opts?: { expiresInSeconds?: number }
): Promise<string> {
  if (!urlStr) return urlStr;

  const parsed = parseSupabaseStorageUrl(urlStr);
  if (!parsed) return urlStr;

  // Se já for uma URL assinada, apenas devolve.
  if (parsed.access === "sign") return urlStr;

  const expiresInSeconds = opts?.expiresInSeconds ?? 60 * 15;

  const { data, error } = await supabase.storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.path, expiresInSeconds);

  if (error || !data?.signedUrl) return urlStr;
  return data.signedUrl;
}

/**
 * Baixa o arquivo via Storage API e devolve o Blob.
 */
export async function downloadStorageBlob(urlStr: string): Promise<Blob> {
  if (!urlStr) throw new Error('URL vazia');

  const parsed = parseSupabaseStorageUrl(urlStr);
  if (!parsed) throw new Error('URL de storage inválida');

  const { data, error } = await supabase.storage.from(parsed.bucket).download(parsed.path);
  if (error || !data) throw error ?? new Error('Falha ao baixar arquivo');

  return data;
}

/**
 * Baixa o arquivo via Storage API e devolve uma Blob URL (blob:...).
 * Útil para download, mas alguns ambientes bloqueiam visualização por iframe.
 */
export async function getStorageBlobUrl(urlStr: string): Promise<string> {
  const blob = await downloadStorageBlob(urlStr);
  return URL.createObjectURL(blob);
}


