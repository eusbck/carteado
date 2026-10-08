// Baldin, Century Herdmaster
// During your turn, each creature assigns combat damage equal to its toughness rather than its power.
// Whenever Baldin attacks, up to one hundred target creatures each get +0/+X until end of turn, where X is the number
// of cards in your hand.
import { defineCard, on, staticAbility, t, tgtsAll, triggered, untilEndOfTurn, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Baldin, Century Herdmaster',
  faces: [{
    abilities: [
      staticAbility({ rules: { assignsByToughness: (c) => c.g.state.turn.active === c.you }, text: 'Durante o seu turno, cada criatura atribui dano de combate igual à resistência em vez da força.' }),
      triggered(on.selfAttacks(), function* (c) {
        const x = c.g.state.zones.hand[c.you].length;
        untilEndOfTurn(c, tgtsAll(c, 0), [{ k: 'pt', p: 0, t: x }]);
      }, { targets: [upTo(100, t.creature(undefined, 'até cem criaturas alvo'))], text: 'Sempre que Baldin ataca, até cem criaturas alvo recebem +0/+X até o fim do turno, onde X é o número de cartas na sua mão.' }),
    ],
  }],
  rulings: { 1: 'não se aplica: o nome alternativo (E. Honda) não aparece em nenhuma carta dos decks' },
});
