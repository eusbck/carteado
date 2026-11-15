// Reunir indícios / collect evidence (CR 701.59a-c): exilar qualquer quantidade de cartas do seu cemitério
// com valor de mana total pelo menos N; como custo adicional, a escolha fica ligada à mágica e às suas cópias.
import { ask, objItem } from './ask.ts';
import { exile } from './actions.ts';
import { manaValue, nameOf } from './chars.ts';
import type { AdditionalCostDef, Gen } from './defs.ts';
import type { G } from './game-context.ts';
import type { Answer, ObjId, PlayerId } from './types.ts';

function cartasDoCemiterio(g: G, p: PlayerId): ObjId[] {
  return g.state.zones.graveyard[p].filter((id) => !g.state.objects[id].isToken && !g.state.objects[id].isCopy);
}

/** CR 701.59b: não se pode escolher reunir indícios quando o total disponível é insuficiente. */
export function canCollectEvidence(g: G, p: PlayerId, n: number): boolean {
  return cartasDoCemiterio(g, p).reduce((soma, id) => soma + manaValue(g, id), 0) >= n;
}

/** CR 701.59a: as cartas são escolhidas pelo jogador e exiladas juntas; permite ultrapassar N. */
export function* collectEvidence(g: G, p: PlayerId, n: number): Gen<ObjId[] | false> {
  if (!canCollectEvidence(g, p, n)) return false;
  const cartas = cartasDoCemiterio(g, p);
  const a = yield* ask<Extract<Answer, { kind: 'select' }>>(g, {
    kind: 'select', player: p, prompt: `Reunir indícios ${n}: exile cartas do seu cemitério com valor de mana total ${n} ou maior`,
    items: cartas.map((id) => ({ ...objItem(g, id, `${nameOf(g, id)} (valor de mana ${manaValue(g, id)})`), card: { def: g.state.objects[id].def } })),
    min: n > 0 ? 1 : 0, max: cartas.length,
  }, (resposta) => resposta.ids.reduce((soma, id) => soma + manaValue(g, Number(id)), 0) >= n
    ? null : `O valor de mana total deve ser ${n} ou maior.`);
  const exiladas = yield* exile(g, a.ids.map(Number));
  return exiladas.filter((id): id is ObjId => id !== null);
}

/** Custo adicional opcional; `c.paid[chave]` informa se foi pago, inclusive em cópias (CR 701.59c, 707.10). */
export function collectEvidenceCost(n: number, chave = 'collectEvidence'): AdditionalCostDef {
  return {
    key: chave, label: `reunir indícios ${n}`, optional: true,
    parts: [{
      k: 'custom', label: `Reunir indícios ${n}`,
      canPay: (c) => canCollectEvidence(c.g, c.you, n),
      *pay(c) {
        const exiladas = yield* collectEvidence(c.g, c.you, n);
        return exiladas === false ? false : { exiledForEvidence: exiladas };
      },
    }],
  };
}
