// Igualdade rasa, para os seletores da loja (useLoja, N27): fica fora da loja para os testes a usarem sem o navegador.

/** igualdade rasa: o mesmo valor, ou objetos (e listas) com as mesmas chaves e os mesmos valores em cada uma */
export function rasa<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (!Object.hasOwn(b, k) || !Object.is((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
  return true;
}
