// lote4-b: ajudantes do deck Sephiroth (sacrifícios, "drenar 1" e o emblema do Super Nova).
import { chooseItems, creaturesOf, gainLife, loseLife, nameOf, objItem, on, putOntoBattlefield, sacrifice, staticAbility, triggered, yesNo, type G, type Gen } from '../motor/api.ts';
import type { AbilityDef, Ctx } from '../motor/defs.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/** emblema do Super Nova: "Sempre que uma criatura morre, o oponente alvo perde 1 de vida e você ganha 1 de vida." */
export const EMBLEMA_SEPHIROTH = 'Sephiroth, One-Winged Angel (emblema)';

/** o oponente alvo perde 1 de vida e você ganha 1 de vida */
export function drena1(c: Ctx, oponente: PlayerId | null): void {
  if (oponente !== null) loseLife(c.g, oponente, 1, c.source);
  gainLife(c.g, c.you, 1, c.source);
}

/** o X da mágica que virou este permanente (0 se não foi conjurada; CR 107.3) */
export function xDaMagica(g: G, id: ObjId): number {
  const o = g.state.objects[id] ?? g.state.lki[id]?.obj;
  if (!o) return 0;
  return o.stack?.x ?? (o.data.spell as { x?: number } | undefined)?.x ?? 0;
}

/** "você pode pagar N de vida": só com vida suficiente (CR 119.4); devolve true se pagou */
export function* talvezPagueVida(g: G, p: PlayerId, n: number, pergunta: string): Gen<boolean> {
  if (g.state.players[p].left || g.state.players[p].life < n) return false;
  if (!(yield* yesNo(g, p, pergunta))) return false;
  loseLife(g, p, n, null);
  return true;
}

/** "você pode sacrificar outra criatura": devolve a sacrificada (ou null). Escolha na resolução */
export function* talvezSacrifiqueOutra(c: Ctx, rotulo: string): Gen<ObjId | null> {
  const outras = creaturesOf(c.g, c.you).filter((id) => id !== c.source);
  if (!outras.length) return null;
  if (!(yield* yesNo(c.g, c.you, `${rotulo}: sacrificar outra criatura?`))) return null;
  const [esc] = yield* chooseItems(c.g, c.you, `${rotulo}: sacrifique outra criatura`, outras.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
  const id = Number(esc);
  const res = yield* sacrifice(c.g, [id]);
  return res.some((x) => x !== null && x !== undefined) ? id : null;
}

/** "você pode sacrificar qualquer número de outras criaturas": devolve quantas foram sacrificadas */
export function* sacrifiqueQuantasQuiser(c: Ctx, rotulo: string): Gen<number> {
  const outras = creaturesOf(c.g, c.you).filter((id) => id !== c.source);
  if (!outras.length) return 0;
  const ids = yield* chooseItems(c.g, c.you, `${rotulo}: sacrifique quantas outras criaturas quiser`, outras.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, outras.length);
  if (!ids.length) return 0;
  const res = yield* sacrifice(c.g, ids.map(Number));
  return res.filter((x) => x !== null && x !== undefined).length;
}


/**
 * Ciclo Enduring (Duskmourn): "Quando [esta] morre, se era uma criatura, devolva-a ao campo de batalha sob o controle do
 * dono. Ela é um encantamento. (Não é uma criatura.)" A carta volta marcada (`data.enduring`) e uma estática dela mesma
 * troca os tipos para só Encantamento, sem subtipos de criatura (rulings 5 e 7 de Enduring Tenacity; camada 4, CR 613.1d).
 * A ficha não volta: deixa de existir no cemitério (CR 111.7).
 */
export function voltaComoEncantamento(nome: string): AbilityDef[] {
  return [
    staticAbility({
      affects: (c, o) => o.id === c.source && !!o.data.enduring,
      mods: () => [{ k: 'setTypes', types: ['Enchantment'], subtypes: [], keepSupertypes: true }],
      text: `${nome} devolvido por esta habilidade é um encantamento (não é uma criatura).`,
    }),
    triggered(on.selfDies(), function* (c) {
      const carta = c.event.obj as number;
      const o = c.g.state.objects[carta];
      if (!o || o.zone !== 'graveyard') return;
      yield* putOntoBattlefield(c.g, [{ id: carta, controller: o.owner, data: { enduring: true } }], 'effect');
    }, {
      // condição interveniente (CR 603.4): era uma criatura ao morrer
      condition: (c) => !!c.g.state.lki[c.event.old as number]?.chars.types.includes('Creature'),
      text: `Quando ${nome} morre, se era uma criatura, devolva-o ao campo de batalha sob o controle do dono. Ele é um encantamento. (Não é uma criatura.)`,
    }),
  ];
}
