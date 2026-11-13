// Chromatic Orrery
// You may spend mana as though it were mana of any color.
// {T}: Add {C}{C}{C}{C}{C}.
// {5}, {T}: Draw a card for each color among permanents you control.
import { activated, defineCard, draw, mana, staticAbility } from '../../motor/api.ts';
import { coresEntrePermanentes } from '../dragoes.ts';

export default defineCard({
  name: 'Chromatic Orrery',
  faces: [{
    abilities: [
      // CR 609.4b: muda só como se paga; o {C} de um custo continua pedindo mana incolor
      staticAbility({
        rules: { spendAsAnyColor: (c, jogador) => jogador === c.you },
        text: 'Você pode gastar mana como se fosse mana de qualquer cor.',
      }),
      mana('CCCCC'),
      activated('{5}, {T}', function* (c) {
        // ruling 1: no máximo cinco cartas (incolor, artefato e "multicolorido" não são cores)
        const n = coresEntrePermanentes(c.g, c.you).length;
        if (n > 0) yield* draw(c.g, c.you, n);
      }, { text: '{5}, {T}: Compre uma carta para cada cor entre os permanentes que você controla.' }),
    ],
  }],
  rulings: {
    1: 'teste: compra uma carta por cor entre os seus permanentes',
  },
});
