// The Immortal Sun
// Players can't activate planeswalkers' loyalty abilities.
// At the beginning of your draw step, draw an additional card.
// Spells you cast cost {1} less to cast.
// Creatures you control get +1/+1.
import { anthem, and, defineCard, draw, is, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'The Immortal Sun',
  faces: [{
    abilities: [
      staticAbility({ rules: { cantActivateLoyalty: () => true }, text: 'Os jogadores não podem ativar habilidades de lealdade de planeswalkers.' }),
      triggered(on.step('draw', 'you'), function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'No início da sua etapa de compra, compre uma carta adicional.' }),
      // ruling 1 (CR 601.2f): a redução vem depois dos aumentos; o valor de mana não muda
      staticAbility({ rules: { costModifier: (c, spell) => (spell.controller === c.you ? { reduce: 1 } : null) }, text: 'As mágicas que você conjura custam {1} a menos para serem conjuradas.' }),
      anthem(and(is.creature, is.yours), () => [{ k: 'pt', p: 1, t: 1 }], 'As criaturas que você controla recebem +1/+1.'),
    ],
  }],
  rulings: {
    1: 'teste: as suas mágicas custam {1} a menos e as do oponente não',
  },
});
