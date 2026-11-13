// lote3-f: ajudantes do deck cEDH Inalla (Wizard's Chess): rituais, tutores, pactos e reanimação.
import {
  additionalCost, ask, defineAbility, exile, is, loseGame, mayPay, moveObjects, nameOf, nextEndStepTrigger, sacrifice, searchLibrary,
  shuffleLibrary, triggered,
  type AdditionalCostDef, type Ctx, type G, type Gen,
} from '../motor/api.ts';
import type { Answer, ObjId, PlayerId } from '../motor/types.ts';

/** "Como custo adicional para conjurar esta mágica, sacrifique uma criatura" (exatamente uma, obrigatória: CR 118.8) */
export function sacrificaCriatura(): AdditionalCostDef {
  return additionalCost('sacrificar', 'sacrificar uma criatura', [{ k: 'sacrifice', n: 1, filter: is.creature, label: 'uma criatura' }]);
}

/** valor de mana da criatura sacrificada no custo, pela última informação dela (CR 608.2h; {X} vale 0, CR 107.3) */
export function valorDaSacrificada(c: Ctx): number {
  const ids = (c.data.costInfo as { sacrificed?: ObjId[] } | undefined)?.sacrificed ?? [];
  const id = ids[0];
  if (id === undefined) return 0;
  return c.g.state.lki[id]?.chars.manaValue ?? 0;
}

/**
 * Tutor (CR 701.23): procura uma carta (com filtro opcional) e a põe na mão, no cemitério ou no topo do grimório. Com
 * 'top', embaralhar e pôr a carta no topo é uma ação só (rulings de Vampiric Tutor e Imperial Seal). Devolve a carta
 * achada (no destino) ou null.
 */
export function* tutor(c: Ctx, destino: 'hand' | 'graveyard' | 'top', opts: { filter?: (id: ObjId) => boolean; prompt?: string; reveal?: boolean } = {}): Gen<ObjId | null> {
  const g = c.g;
  const [achada] = yield* searchLibrary(g, c.you, c.you, { max: 1, filter: opts.filter, prompt: opts.prompt ?? 'Procure uma carta' });
  if (achada !== undefined && opts.reveal) g.log(`${g.state.players[c.you].name} revela ${nameOf(g, achada)}.`, { rule: '701.20' });
  if (destino === 'top') {
    shuffleLibrary(g, c.you);
    if (achada !== undefined && g.state.objects[achada]?.zone === 'library') {
      const [n] = yield* moveObjects(g, [{ id: achada, to: 'library', position: 'top' }], 'effect');
      return n ?? null;
    }
    return null;
  }
  let res: ObjId | null = null;
  if (achada !== undefined) [res] = (yield* moveObjects(g, [{ id: achada, to: destino }], 'search')) as (ObjId | null)[];
  shuffleLibrary(g, c.you);
  return res ?? null;
}

/**
 * O gatilho atrasado dos Pactos (CR 603.7): "No início da sua próxima manutenção, pague [custo]. Se não pagar, você
 * perde o jogo." Só dispara na manutenção de quem conjurou, num turno depois do atual. Use `delayed(c, id)` na resolução.
 */
export function pactoNaManutencao(carta: string, custo: string): string {
  return defineAbility(`${carta}:manutencao`, triggered({
    kind: 'event',
    match: (e, c) => e.type === 'step' && e.step === 'upkeep' && e.active === c.you
      && c.g.state.turn.number > ((c as unknown as { delayed?: { createdTurn: number } }).delayed?.createdTurn ?? -1),
  }, function* (c) {
    // CR 118.12: pagar é opcional; quem não paga (ou não consegue) perde o jogo (CR 104.3e)
    const pagou = yield* mayPay(c, c.you, custo, `não perder o jogo (${carta})`);
    if (!pagou) {
      c.g.log(`${c.g.state.players[c.you].name} não paga ${custo} e perde o jogo (${carta}).`, { rule: '104.3e' });
      loseGame(c.g, c.you);
    }
  }, { text: `No início da sua próxima manutenção, pague ${custo}. Se não pagar, você perde o jogo.` })).id!;
}

/** jogador ainda está na partida */
export function naPartida(c: Ctx, p: PlayerId): boolean {
  return !c.g.state.players[p].left;
}

/** o jogador põe estas cartas na ordem que quiser ("em qualquer ordem"); devolve a ordem, a primeira em cima */
export function* emQualquerOrdem(g: G, p: PlayerId, ids: ObjId[], prompt: string, destino: 'top' | 'bottom'): Gen<ObjId[]> {
  if (ids.length <= 1) return [...ids];
  const a = yield* ask<Extract<Answer, { kind: 'arrange' }>>(g, {
    kind: 'arrange', player: p, prompt,
    items: ids.map((id) => ({ id: String(id), label: nameOf(g, id), obj: id, card: { def: g.state.objects[id].def } })),
    destinations: [destino],
  });
  return a.order.map(Number);
}

/** gatilho atrasado "no início da próxima etapa final, sacrifique-a" (CR 603.7, 513.2); dados: { obj } */
export const SACRIFICA_NO_FIM = defineAbility('cedh:sacrificaNoFim', nextEndStepTrigger(function* (c) {
  const id = c.data.obj as ObjId;
  // CR 603.7c: se a permanente saiu do campo, é outro objeto e fica onde está
  if (c.g.state.objects[id]?.zone === 'battlefield') yield* sacrifice(c.g, [id]);
}, 'No início da próxima etapa final, sacrifique-a.')).id!;

/** gatilho atrasado "exile-a no início da próxima etapa final" (CR 603.7, 513.2); dados: { obj } */
export const EXILA_NO_FIM = defineAbility('cedh:exilaNoFim', nextEndStepTrigger(function* (c) {
  const id = c.data.obj as ObjId;
  if (c.g.state.objects[id]?.zone === 'battlefield') yield* exile(c.g, [id]);
}, 'Exile-a no início da próxima etapa final.')).id!;
