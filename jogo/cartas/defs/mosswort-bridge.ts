// Mosswort Bridge
// Hideaway 4 (When this land enters, look at the top four cards of your library, exile one face down, then put the rest
// on the bottom in a random order.)
// This land enters tapped.
// {T}: Add {G}.
// {G}, {T}: You may play the exiled card without paying its mana cost if creatures you control have total power 10 or
// greater.
import { activated, defineCard, hideaway, land, linkedExiled, mana, mayPlayFree, nameOf } from '../../motor/api.ts';
import { forcaTotal } from '../dinossauros.ts';

export default defineCard({
  name: 'Mosswort Bridge',
  faces: [{
    abilities: [
      // CR 702.75a
      hideaway(4),
      land.tapped(),
      mana('G'),
      activated('{G}, {T}', function* (c) {
        // a força total é conferida na resolução
        if (forcaTotal(c.g, c.you) < 10) return;
        const [carta] = linkedExiled(c.g, c.source, 'hideaway');
        if (carta === undefined) return;
        yield* mayPlayFree(c.g, c.you, carta, `Mosswort Bridge: jogar ${nameOf(c.g, carta)} sem pagar o custo de mana?`);
      }, { text: '{G}, {T}: Você pode jogar a carta exilada sem pagar o custo de mana se as criaturas que você controla têm força total 10 ou mais.' }),
    ],
  }],
  rulings: {
    1: 'teste: esconderijo 4 exila uma das quatro do topo virada para baixo e põe as outras no fundo; entra virado',
    2: 'regra geral: CR 702.75a — quem controla o permanente pode olhar a carta escondida (motor/criaturas.ts hideaway, visibleTo)',
    3: 'teste: esconderijo 4 exila uma das quatro do topo virada para baixo e põe as outras no fundo; entra virado',
    4: 'regra geral: CR 702.75a — o resto vai para o fundo em ordem aleatória (testes/regras-criaturas.test.ts)',
  },
});
