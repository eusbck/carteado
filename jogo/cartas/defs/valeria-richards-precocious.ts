// Valeria Richards, Precocious
// Noncreature spells you cast cost {1} less to cast.
// Whenever you cast your first noncreature spell each turn, draw a card.
import { defineCard, draw, isCreature, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Valeria Richards, Precocious',
  faces: [{
    abilities: [
      // CR 601.2f: reduz só a parte genérica do custo total
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && !spell.chars.types.includes('Creature') ? { reduce: 1 } : null) },
        text: 'As mágicas que não são de criatura que você conjura custam {1} a menos.',
      }),
      // a contagem do turno já inclui a mágica que acabou de ser conjurada
      triggered(on.custom((e, c) => (e.type === 'cast' && !e.copy && e.player === c.you && !!c.g.state.objects[e.obj] && !isCreature(c.g, e.obj)
        && (c.g.state.turnStats[c.you]?.noncreatureSpellsCast ?? 0) === 1)), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que você conjura a sua primeira mágica que não é de criatura em cada turno, compre uma carta.' }),
    ],
  }],
  rulings: {},
});
