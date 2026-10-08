// Gray Merchant of Asphodel
// When this creature enters, each opponent loses X life, where X is your devotion to black. You gain life equal to the
// life lost this way. (Each {B} in the mana costs of permanents you control counts toward your devotion to black.)
import { chars, controlledBy, defineCard, etb, gainLife, loseLife } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ManaSymbol, PlayerId } from '../../motor/types.ts';

/** símbolo de mana que conta para a devoção ao preto: {B}, híbridos com preto, {2/B} e {B/P} (ruling 2) */
function preto(s: ManaSymbol): boolean {
  if (s.k === 'color' || s.k === 'monohybrid' || s.k === 'phyrexian') return s.c === 'B';
  if (s.k === 'hybrid') return s.a === 'B' || s.b === 'B';
  return false; // genérico, {X}, {C}: não contam (ruling 3)
}

/** CR 700.5: símbolos de mana pretos entre os custos de mana dos permanentes que o jogador controla */
function devocaoAoPreto(g: G, p: PlayerId): number {
  return controlledBy(g, p).reduce((n, id) => n + (chars(g, id).manaCost ?? []).filter(preto).length, 0);
}

export default defineCard({
  name: 'Gray Merchant of Asphodel',
  faces: [{
    abilities: [etb(function* (c) {
      // ruling 5: devoção contada na resolução, com este permanente se ainda estiver no campo
      const x = devocaoAoPreto(c.g, c.you);
      let perdida = 0;
      for (const p of c.g.opponents(c.you)) perdida += loseLife(c.g, p, x, c.source);
      // ruling 1: ganha o total perdido, não só X
      if (perdida > 0) gainLife(c.g, c.you, perdida, c.source);
    }, { text: 'Quando esta criatura entra, cada oponente perde X de vida, onde X é a sua devoção ao preto. Você ganha vida igual à vida perdida assim.' })],
  }],
  rulings: {
    1: 'teste: no multijogador, ganha o total perdido pelos oponentes',
    2: 'teste: híbridos, {2/B} e phyrexianos contam; genérico não',
    3: 'teste: híbridos, {2/B} e phyrexianos contam; genérico não',
    4: 'regra geral: CR 700.5 — só custos de mana contam (o texto não entra em manaCost)',
    5: 'teste: devoção contada na resolução; sem o Merchant no campo, ele não conta',
    6: 'teste: a sua Aura presa a um permanente do oponente conta; o permanente do oponente não',
  },
});
