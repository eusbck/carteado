// Bontu's Monument
// Black creature spells you cast cost {1} less to cast.
// Whenever you cast a creature spell, each opponent loses 1 life and you gain 1 life.
import { defineCard, gainLife, is, loseLife, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Bontu's Monument",
  faces: [{
    abilities: [
      // rulings 3-4: mágica multicolorida com preto conta; só a parte genérica do custo total (CR 601.2f, 118.7a)
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.types.includes('Creature') && spell.chars.colors.includes('B') ? { reduce: 1 } : null) },
        text: 'As mágicas de criatura pretas que você conjura custam {1} a menos.',
      }),
      // rulings 2 e 5: qualquer mágica de criatura; resolve antes dela, mesmo que ela seja anulada
      triggered(on.youCast(is.creature), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que você conjura uma mágica de criatura, cada oponente perde 1 de vida e você ganha 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'não se aplica: não há Gigante de Duas Cabeças nesta mesa (Commander)',
    2: 'teste: mágica de criatura não preta dispara, mas não fica mais barata',
    3: 'teste: mágica de criatura preta multicolorida fica mais barata',
    4: 'regra geral: CR 601.2f, 118.7a — redução genérica no custo total; valor de mana inalterado (motor/stack.ts)',
    5: 'teste: o gatilho resolve antes da mágica de criatura, mesmo que ela seja anulada',
  },
});
