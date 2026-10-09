// Reaproveitamento estrutural: cada mensagem do servidor traz a vista inteira da partida, com objetos novos mesmo
// para o que não mudou. `compartilhar(antigo, novo)` devolve `novo` com cada pedaço igual ao de `antigo` trocado
// pelo de `antigo` (a mesma referência). Assim a carta que não mudou chega à tela com o mesmo objeto, e os memos
// da mesa (cartas, arrumação de cada área) pulam o que não mudou.
//
// Listas de objetos com `id` numérico (cartas, jogadores, pilha) são casadas pelo id, não pela posição: uma carta que
// entra no começo do campo não faz todas as outras parecerem novas.

type Qualquer = unknown;

const temId = (x: Qualquer): x is { id: number } => typeof x === 'object' && x !== null && typeof (x as { id?: unknown }).id === 'number';

export function compartilhar<T>(antigo: Qualquer, novo: T): T {
  if (antigo === novo) return novo;
  if (typeof antigo !== 'object' || typeof novo !== 'object' || antigo === null || novo === null) return novo;
  if (Array.isArray(novo)) {
    if (!Array.isArray(antigo)) return novo;
    const porId = novo.length > 0 && temId(novo[0]) ? new Map<number, Qualquer>() : null;
    if (porId) for (const x of antigo) if (temId(x)) porId.set(x.id, x);
    let igual = antigo.length === novo.length;
    const saida = novo.map((x, i) => {
      const par = porId && temId(x) ? porId.get(x.id) : antigo[i];
      const y = compartilhar(par, x);
      if (y !== antigo[i]) igual = false;
      return y;
    });
    return (igual ? antigo : saida) as T;
  }
  if (Array.isArray(antigo)) return novo;
  const a = antigo as Record<string, Qualquer>;
  const n = novo as Record<string, Qualquer>;
  const chaves = Object.keys(n);
  let igual = chaves.length === Object.keys(a).length;
  const saida: Record<string, Qualquer> = {};
  for (const k of chaves) {
    const y = compartilhar(a[k], n[k]);
    saida[k] = y;
    if (y !== a[k] || !(k in a)) igual = false;
  }
  return (igual ? antigo : saida) as T;
}
