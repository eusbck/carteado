// Conta de mana só para a interface: a reserva cobre o custo? O motor continua sendo quem
// decide; isto serve para confirmar o pagamento sozinho quando a resposta é óbvia.

const CORES = new Set(['W', 'U', 'B', 'R', 'G', 'C']);

const simbolos = (s: string) => [...s.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);

/**
 * true se a reserva paga o custo, false se não paga, null se o custo tem símbolos que esta
 * conta não cobre (phyrexiano, neve, X ainda sem valor…): aí quem confirma é a pessoa.
 */
export function reservaPaga(custo: string, reserva: string): boolean | null {
  const pool: Record<string, number> = {};
  for (const s of simbolos(reserva)) pool[s] = (pool[s] ?? 0) + 1;
  let generico = 0;
  const hibridos: string[][] = [];
  const mono: string[] = [];
  for (const s of simbolos(custo)) {
    if (/^\d+$/.test(s)) { generico += Number(s); continue; }
    if (CORES.has(s)) {
      if (!pool[s]) return false;
      pool[s]--;
      continue;
    }
    const partes = s.split('/');
    if (partes.length === 2 && partes.every((p) => CORES.has(p))) { hibridos.push(partes); continue; }
    if (partes.length === 2 && /^\d+$/.test(partes[0]) && CORES.has(partes[1])) { mono.push(s); continue; }
    return null;
  }
  // híbridos: usa a cor de que sobra mais
  for (const [a, b] of hibridos) {
    const c = (pool[a] ?? 0) >= (pool[b] ?? 0) ? a : b;
    if (!pool[c]) return false;
    pool[c]--;
  }
  // {2/W}: a cor se tiver, senão dois genéricos
  for (const s of mono) {
    const [n, c] = s.split('/');
    if (pool[c]) pool[c]--; else generico += Number(n);
  }
  const resto = Object.values(pool).reduce((a, b) => a + b, 0);
  return resto >= generico;
}
