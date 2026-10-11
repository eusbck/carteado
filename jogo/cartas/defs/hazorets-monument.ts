// Hazoret's Monument
// Red creature spells you cast cost {1} less to cast.
// Whenever you cast a creature spell, you may discard a card. If you do, draw a card.
import { defineCard, discard, draw, is, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Hazoret's Monument",
  faces: [{
    abilities: [
      // rulings 2-3: mágica multicolorida com vermelho conta; só a parte genérica do custo total (CR 601.2f)
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.types.includes('Creature') && spell.chars.colors.includes('R') ? { reduce: 1 } : null) },
        text: 'As mágicas de criatura vermelhas que você conjura custam {1} a menos.',
      }),
      // rulings 1 e 4: qualquer mágica de criatura; resolve antes dela, mesmo que ela seja anulada
      triggered(on.youCast(is.creature), function* (c) {
        if (c.g.state.zones.hand[c.you].length === 0) return;
        // CR 118.12: "você pode descartar; se fizer isso, compre"
        const descartadas = yield* discard(c.g, c.you, 1, { upTo: true });
        if (descartadas.length) yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que você conjura uma mágica de criatura, você pode descartar uma carta. Se fizer isso, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: mágica de criatura não vermelha dispara, mas não fica mais barata',
    2: 'teste: mágica de criatura vermelha multicolorida fica mais barata',
    3: 'regra geral: CR 601.2f, 118.7a — redução genérica no custo total; valor de mana inalterado (motor/stack.ts)',
    4: 'teste: o gatilho resolve antes da mágica de criatura, mesmo que ela seja anulada',
  },
});
