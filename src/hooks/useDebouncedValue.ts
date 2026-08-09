import { useEffect, useState } from "react";

/**
 * Retorna `value` com um atraso de `delayMs`, atualizando só depois que o
 * usuário para de digitar. Usado para não disparar uma request pra API a
 * cada tecla em campos de busca ligados a queries do servidor.
 *
 * const [search, setSearch] = useState("");
 * const debouncedSearch = useDebouncedValue(search, 400);
 * // dispara a query com `debouncedSearch`, mas o input reflete `search` na hora
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}