// Ipnu Rivulet
// {T}: Add {C}.
// {T}, Pay 1 life: Add {U}.
// {1}{U}, {T}, Sacrifice a Desert: Target player mills four cards. (They put the top four cards of their library into
// their graveyard.)
import { activated, defineCard, mana, mill, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Ipnu Rivulet',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana('U', { cost: '{T}, Pay 1 life', text: '{T}, Pague 1 de vida: Adicione {U}.' }),
      activated('{1}{U}, {T}, Sacrifice a Desert', function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) yield* mill(c.g, p, 4);
      }, { targets: [t.player()], text: '{1}{U}, {T}, Sacrifique um Desert: O jogador alvo mói quatro cartas.' }),
    ],
  }],
  rulings: {
    1: 'teste: pode sacrificar a si mesma para pagar o custo',
    2: 'regra geral: CR 205.3i — Desert não tem habilidade de mana intrínseca',
  },
});
