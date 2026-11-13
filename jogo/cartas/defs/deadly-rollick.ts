// Deadly Rollick
// If you control a commander, you may cast this spell without paying its mana cost.
// Exile target creature.
import { controllerOf, defineCard, exile, t, tgt } from '../../motor/api.ts';
import { ehComandante } from '../vingadores.ts';

export default defineCard({
  name: 'Deadly Rollick',
  faces: [{
    // ruling 1: qualquer comandante sob o seu controle serve, seja de quem for (CR 118.9)
    altCosts: [{
      key: 'gratis', label: 'sem pagar o custo de mana (você controla um comandante)', zone: 'hand', mana: '',
      condition: (c) => c.g.state.zones.battlefield.some((id) => controllerOf(c.g, id) === c.you && ehComandante(c.g, id)),
    }],
    spell: {
      targets: [t.creature()],
      *effect(c) { const id = tgt(c); if (id !== null) yield* exile(c.g, [id]); },
    },
  }],
  rulings: {
    1: 'teste: controlando um comandante, exila a criatura alvo sem pagar o custo de mana',
    2: 'regra geral: CR 601.2 — depois de começar a conjurar, ninguém age até o fim da conjuração (motor/stack.ts)',
  },
});
