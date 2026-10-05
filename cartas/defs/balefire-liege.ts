// Balefire Liege
// Other red creatures you control get +1/+1.
// Other white creatures you control get +1/+1.
// Whenever you cast a red spell, this creature deals 3 damage to target player or planeswalker.
// Whenever you cast a white spell, you gain 3 life.
import { and, anthem, dealDamage, defineCard, gainLife, is, on, t, tgtRef, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Balefire Liege',
  faces: [{
    abilities: [
      // ruling 1: os dois bônus somam
      anthem(and(is.creature, is.yours, is.other, is.color('R')), () => [{ k: 'pt', p: 1, t: 1 }], 'As outras criaturas vermelhas que você controla recebem +1/+1.'),
      anthem(and(is.creature, is.yours, is.other, is.color('W')), () => [{ k: 'pt', p: 1, t: 1 }], 'As outras criaturas brancas que você controla recebem +1/+1.'),
      triggered(on.youCast(is.color('R')), function* (c) {
        const r = tgtRef(c);
        if (r) dealDamage(c.g, [{ source: c.source, target: r, amount: 3, combat: false }]);
      }, { targets: [t.playerOrPlaneswalker()], text: 'Sempre que você conjura uma mágica vermelha, esta criatura causa 3 de dano ao jogador ou planeswalker alvo.' }),
      triggered(on.youCast(is.color('W')), function* (c) { gainLife(c.g, c.you, 3, c.source); }, { text: 'Sempre que você conjura uma mágica branca, você ganha 3 de vida.' }),
    ],
  }],
  rulings: { 1: 'teste: criatura vermelha e branca recebe +2/+2' },
});
