// Peças repetidas nas cartas do deck Miracle Worker (Duskmourn Commander): notas dos rulings de milagre, "ponha no
// fundo do grimório do dono" com a ordem escolhida por cada dono, reordenar o topo de um grimório, devoção a duas cores
// e encantamentos de um jogador.
import { chars, chooseItems, controlledBy, isType, moveObjects, nameOf } from '../motor/api.ts';
import type { Ctx, Gen } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { Color, ManaSymbol, ObjId, PlayerId } from '../motor/types.ts';

/** notas dos rulings de milagre, repetidos em todas as cartas com milagre (motor/milagre.ts, testes/regras-milagre.test.ts) */
export const MILAGRE = {
  revelarAntes: 'regra geral: CR 702.94a — a pergunta de revelar vem na própria compra, antes de a carta se misturar com a mão (motor/actions.ts revelaMilagre)',
  qualquerTurno: 'regra geral: CR 702.94a — vale em qualquer turno, se for a primeira carta comprada nele (testes/regras-milagre.test.ts)',
  primeiraDaSequencia: 'regra geral: CR 121.2, 702.94a — "compre três" são três compras: só a primeira pode ser revelada (testes/regras-milagre.test.ts)',
  semComprar: 'regra geral: CR 121.1 — pôr na mão sem a palavra "comprar" não é comprar: nada é perguntado (só draw chama revelaMilagre)',
  naoPrecisaRevelar: 'regra geral: CR 702.94a — revelar é opcional (testes/regras-milagre.test.ts)',
  soNaResolucao: 'regra geral: CR 702.94a — só se conjura pelo custo de milagre enquanto o gatilho resolve; depois, só pelo custo normal (testes/regras-milagre.test.ts)',
  ignoraTempo: 'regra geral: CR 608.2g — conjurada durante a resolução do gatilho, sem olhar o tempo do tipo (testes/regras-milagre.test.ts)',
  custoAlternativo: 'regra geral: CR 118.9, 702.94a — milagre é custo alternativo: não se junta a outro; custos adicionais continuam (motor/stack.ts)',
  custoTotal: 'regra geral: CR 601.2f — aumentos e reduções se aplicam ao custo de milagre; o valor de mana não muda (motor/stack.ts totalSpellCost)',
  saiuDaMao: 'regra geral: CR 702.94a — se a carta sai da mão antes de o gatilho resolver, não há o que conjurar (testes/regras-milagre.test.ts)',
  continuaComprada: 'regra geral: CR 702.94a — a compra acontece de qualquer jeito (gatilhos de comprar disparam); sem conjurar, a carta fica na mão (testes/regras-milagre.test.ts)',
};

/**
 * "Ponha [esses permanentes] no fundo do grimório dos donos": cada dono escolhe a ordem dos seus, em segredo (ruling de
 * Terminus), na ordem APNAP, e todos vão ao mesmo tempo (CR 101.4). A primeira escolhida fica mais acima.
 */
export function* poeNoFundoDosDonos(c: Ctx, ids: ObjId[]): Gen<void> {
  const s = c.g.state;
  const ordem: ObjId[] = [];
  for (const p of c.g.apnap()) {
    let deles = ids.filter((id) => s.objects[id]?.owner === p);
    if (deles.length > 1) {
      const r = yield* chooseItems(c.g, p, 'Ordene as suas permanentes para o fundo do grimório: a primeira fica mais acima, a última fica no fundo',
        deles.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id })), deles.length, deles.length, true);
      deles = r.map(Number);
    }
    ordem.push(...deles);
  }
  if (ordem.length) yield* moveObjects(c.g, ordem.map((id) => ({ id, to: 'library' as const, position: 'bottom' as const })), 'effect');
}

/** "olhe as N cartas do topo do grimório do jogador e ponha-as de volta em qualquer ordem" (CR 401.4): você escolhe */
export function* reordenaTopoDe(c: Ctx, dono: PlayerId, n: number, rotulo: string): Gen<void> {
  const s = c.g.state;
  const topo = s.zones.library[dono].slice(0, Math.max(0, n));
  if (topo.length === 0) return;
  // quem olha vê as cartas (CR 401.4: olhar não revela aos outros)
  for (const id of topo) {
    const o = s.objects[id];
    if (o.visibleTo !== 'all') o.visibleTo = [...new Set([...(Array.isArray(o.visibleTo) ? o.visibleTo : []), c.you])];
  }
  c.g.bump();
  if (topo.length < 2) return;
  const ordem = (yield* chooseItems(c.g, c.you, `${rotulo}: ponha as cartas de volta no topo na ordem que quiser (a primeira escolhida fica no topo)`,
    topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } })), topo.length, topo.length, true)).map(Number);
  const lib = s.zones.library[dono];
  s.zones.library[dono] = [...ordem, ...lib.filter((id) => !ordem.includes(id))];
  c.g.bump();
}

/** o símbolo de mana tem alguma destas cores? (híbridos, {2/B} e phyrexianos contam; genérico, {X} e {C} não, CR 700.5) */
function temCor(s: ManaSymbol, cores: Color[]): boolean {
  if (s.k === 'color' || s.k === 'monohybrid' || s.k === 'phyrexian') return cores.includes(s.c as Color);
  if (s.k === 'hybrid') return cores.includes(s.a as Color) || cores.includes(s.b as Color);
  return false;
}

/** CR 700.5, 700.5a: devoção a uma ou duas cores; um símbolo híbrido das duas conta uma vez só (ruling de Athreos) */
export function devocao(g: G, p: PlayerId, cores: Color[]): number {
  return controlledBy(g, p).reduce((n, id) => n + (chars(g, id).manaCost ?? []).filter((s) => temCor(s, cores)).length, 0);
}

/** encantamentos que o jogador controla */
export function encantamentosDe(g: G, p: PlayerId): ObjId[] {
  return controlledBy(g, p, (id) => isType(g, id, 'Enchantment'));
}
