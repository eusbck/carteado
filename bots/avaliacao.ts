// Avaliação de um estado do ponto de vista de um jogador. Usa só o que esse jogador pode ver:
// vida, mesa, quantidade de cartas na mão e no grimório, dano de comandante e veneno.

import { chars, hasKw, isCreature, isLand, manaValue, power, toughness } from '../motor/api.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

const PALAVRAS: Record<string, number> = {
  flying: 1, trample: 0.6, deathtouch: 1.2, lifelink: 0.8, 'first strike': 0.8, vigilance: 0.4, hexproof: 0.8,
  indestructible: 1.5, menace: 0.6, reach: 0.3, haste: 0.2, ward: 0.5, shroud: 0.6, wither: 0.5,
};

/** valor aproximado de um permanente na mesa (terrenos à parte) */
export function valorPermanente(g: G, id: ObjId): number {
  const o = g.state.objects[id];
  const c = chars(g, id);
  if (c.types.includes('Land') && !c.types.includes('Creature')) return 0; // terrenos contam no total de mana
  let v = 1 + 0.5 * manaValue(g, id);
  if (isCreature(g, id)) {
    const p = Math.max(0, power(g, id));
    const t = Math.max(0, toughness(g, id) - (o.damage ?? 0));
    v += 1.3 * p + 0.8 * t;
    for (const [kw, b] of Object.entries(PALAVRAS)) if (hasKw(g, id, kw)) v += b;
    if (hasKw(g, id, 'double strike')) v += p;
    if (hasKw(g, id, 'defender')) v -= 0.8 * p;
  }
  if (c.types.includes('Planeswalker')) v += 2 + (o.counters.loyalty ?? 0);
  // fichas que não são criaturas (Tesouro, Pista): pouco valor duradouro
  if (o.isToken && !isCreature(g, id)) v = Math.min(v, 1.2);
  return v;
}

/** valor dos terrenos: os primeiros valem muito; do oitavo ao décimo, menos; depois, pouco */
function valorTerrenos(n: number, desvirados: number): number {
  const base = Math.min(n, 7) * 2.4 + Math.min(Math.max(0, n - 7), 3) * 1.2 + Math.max(0, n - 10) * 0.7;
  return base + 0.15 * desvirados;
}

const vidaV = (l: number): number => (l <= 0 ? -200 : 12 * Math.log(1 + l));

/** quanto maior, melhor para `eu` */
export function avaliar(g: G, eu: PlayerId): number {
  const s = g.state;
  const me = s.players[eu];
  if (me.lost || me.left || (s.gameOver && !s.gameOver.winners.includes(eu) && !s.gameOver.draw)) return -1e6;
  if (s.gameOver && s.gameOver.winners.includes(eu)) return 1e6;
  let v = 0;
  const ops = s.players.filter((p) => p.id !== eu && !p.left && !p.lost);
  const fora = s.players.filter((p) => p.id !== eu && (p.left || p.lost)).length;
  v += fora * 80;
  v += 1.5 * vidaV(me.life);
  for (const o of ops) v -= 0.8 * vidaV(o.life);

  // mesa
  const terrenos = new Map<PlayerId, { n: number; d: number }>();
  for (const id of s.zones.battlefield) {
    const o = s.objects[id];
    if (o.phasedOut) continue;
    const c = chars(g, id);
    const dono = c.controller;
    if (c.types.includes('Land') && !c.types.includes('Creature')) {
      const t = terrenos.get(dono) ?? { n: 0, d: 0 };
      t.n++;
      if (!o.tapped) t.d++;
      terrenos.set(dono, t);
      continue;
    }
    const val = valorPermanente(g, id);
    if (dono === eu) v += val;
    else if (!s.players[dono].left) v -= 0.55 * val;
  }
  for (const [p, t] of terrenos) {
    if (p === eu) v += valorTerrenos(t.n, t.d);
    else if (!s.players[p].left) v -= 0.3 * valorTerrenos(t.n, 0);
  }

  // cartas
  // a própria mão: terrenos valem pouco ali (o valor está em jogá-los)
  const mao = s.zones.hand[eu];
  const terrenosNaMao = mao.filter((id) => isLand(g, id)).length;
  const outras = mao.length - terrenosNaMao;
  v += 2.6 * Math.min(outras, 7) + 0.6 * Math.max(0, outras - 7) + 0.5 * terrenosNaMao;
  for (const o of ops) v -= 0.4 * Math.min(s.zones.hand[o.id].length, 7);
  const grim = s.zones.library[eu].length;
  if (grim < 4) v -= 12 * (4 - grim);

  // comandante e veneno
  for (const d of Object.values(me.commanderDamage)) v -= d * d * 0.05;
  v -= 4 * (me.counters.poison ?? 0);
  for (const o of ops) v += 2 * (o.counters.poison ?? 0);
  return v;
}
