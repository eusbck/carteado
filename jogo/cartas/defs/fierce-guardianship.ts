// Fierce Guardianship
// If you control a commander, you may cast this spell without paying its mana cost.
// Counter target noncreature spell.
import { chars, controllerOf, counter, defineCard, t, tgt } from '../../motor/api.ts';
import { ehComandante } from '../vingadores.ts';

export default defineCard({
  name: 'Fierce Guardianship',
  faces: [{
    // ruling 1: qualquer comandante sob o seu controle serve, seja de quem for
    altCosts: [{
      key: 'gratis', label: 'sem pagar o custo de mana (você controla um comandante)', zone: 'hand', mana: '',
      condition: (c) => c.g.state.zones.battlefield.some((id) => controllerOf(c.g, id) === c.you && ehComandante(c.g, id)),
    }],
    spell: {
      targets: [t.spell((c, id) => !chars(c.g, id).types.includes('Creature'), 'mágica alvo que não é de criatura')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* counter(c.g, id); },
    },
  }],
  rulings: {
    1: 'teste: controlando um comandante, anula a mágica que não é de criatura sem pagar o custo de mana',
    2: 'regra geral: CR 601.2 — depois de começar a conjurar, ninguém age até o fim da conjuração (motor/stack.ts)',
  },
});