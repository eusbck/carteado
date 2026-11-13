// lote3-b: destemido (undaunted, CR 702.125) concedido à próxima mágica: "a próxima mágica de criatura artefato e a
// próxima mágica de Spacecraft que você conjurar neste turno têm destemido" (Võx, Child of the Collective).
// Cada concessão é um efeito de regra até o fim do turno que reduz {1} por oponente ainda no jogo (702.125a-b) e acaba
// quando uma mágica que passa no filtro é conjurada (gancho consumedByCast). Duas concessões na mesma mágica se somam
// (702.125c).

import { chars } from './chars.ts';
import type { Ctx, SCtx } from './defs.ts';
import { defineAbility } from './defs.ts';
import { staticAbility } from './dsl.ts';
import { ruleEffect } from './efeitos.ts';
import type { Chars, PlayerId } from './types.ts';

type FiltroMagica = (ch: Chars) => boolean;
const filtros = new Map<string, FiltroMagica>();
type Params = { player: PlayerId; filtro: string };

const DESTEMIDO = 'rule:undauntedNext';
defineAbility(DESTEMIDO, staticAbility({
  rules: {
    costModifier: (c, spell) => {
      const p = (c as SCtx & { params?: Params }).params;
      if (!p || spell.controller !== p.player) return null;
      const f = filtros.get(p.filtro);
      if (!f || !f(spell.chars)) return null;
      const n = c.g.opponents(p.player).filter((o) => !c.g.state.players[o].left).length;
      return n > 0 ? { reduce: n } : null;
    },
    consumedByCast: (c, player, spell) => {
      const p = (c as SCtx & { params?: Params }).params;
      const f = p ? filtros.get(p.filtro) : undefined;
      return !!p && !!f && player === p.player && f(chars(c.g, spell));
    },
  },
  text: 'A próxima mágica tem destemido.',
}));

/** registra um filtro de mágica com um nome estável (o estado guarda só o nome) */
export function registerUndauntedFilter(chave: string, filtro: FiltroMagica): void {
  filtros.set(chave, filtro);
}

/** "a próxima mágica [filtro] que [jogador] conjurar neste turno tem destemido" */
export function undauntedNext(c: Ctx, player: PlayerId, chave: string): void {
  ruleEffect(c, DESTEMIDO, { kind: 'endOfTurn' }, { params: { player, filtro: chave } });
}
