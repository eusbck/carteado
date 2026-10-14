// Niv-Mizzet, Parun
// This spell can't be countered.
// Flying
// Whenever you draw a card, Niv-Mizzet deals 1 damage to any target.
// Whenever a player casts an instant or sorcery spell, you draw a card.
import { dealDamage, defineCard, draw, is, keyword, on, t, tgtRef, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Niv-Mizzet, Parun',
  faces: [{
    // CR 101.2: "não pode ser anulada" funciona na pilha
    cantBeCountered: true,
    abilities: [
      keyword('flying'),
      // ruling 1: uma vez por carta comprada; ruling 2: pôr na mão sem "comprar" não dispara
      triggered(on.custom((e, c) => e.type === 'draw' && e.player === c.you), function* (c) {
        const alvo = tgtRef(c);
        if (alvo) dealDamage(c.g, [{ source: c.source, target: alvo, amount: 1, combat: false }]);
      }, { targets: [t.any()], text: 'Sempre que você compra uma carta, Niv-Mizzet causa 1 de dano a qualquer alvo.' }),
      // ruling 3: resolve antes da mágica, mesmo que ela seja anulada
      triggered(on.custom((e, c) => e.type === 'cast' && !!c.g.state.objects[e.obj] && is.instantOrSorcery(c, e.obj)), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que um jogador conjura uma mágica instantânea ou de feitiço, você compra uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: comprar duas cartas dispara duas vezes',
    2: 'regra geral: só o evento de compra dispara (motor/actions.ts draw)',
    3: 'teste: a mágica de um oponente faz você comprar, e a compra causa 1 de dano, tudo antes de a mágica resolver',
    4: 'regra geral: CR 117.3 — os jogadores recebem prioridade entre a compra e a mágica',
  },
});
