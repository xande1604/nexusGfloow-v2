import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches all rows from a Supabase query, paginating automatically
 * to bypass the default 1000-row limit.
 */
export async function fetchAllRows<T = any>(
  tableName: string,
  options?: {
    select?: string;
    order?: { column: string; ascending?: boolean };
    filters?: (query: any) => any;
    pageSize?: number;
  }
): Promise<T[]> {
  const pageSize = options?.pageSize || 1000;
  let allData: T[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    let query = (supabase.from as any)(tableName)
      .select(options?.select || '*')
      .range(from, from + pageSize - 1);

    if (options?.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
    }

    if (options?.filters) {
      query = options.filters(query);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (data && data.length > 0) {
      allData = allData.concat(data as T[]);
      from += pageSize;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  return allData;
}
