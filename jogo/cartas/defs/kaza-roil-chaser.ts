// Kaza, Roil Chaser
// Flying, haste
// {T}: The next instant or sorcery spell you cast this turn costs {X} less to cast, where X is the number of Wizards you
// control as this ability resolves.
import { activated, controlledBy, defineCard, isCreature, isSubtype, keywords, ruleEffect } from '../../motor/api.ts';
import { PROXIMA_MAIS_BARATA } from '../saque.ts';

export default defineCard({
  name: 'Kaza, Roil Chaser',
  faces: [{
    abilities: [
      ...keywords('flying', 'haste'),
      activated('{T}', function* (c) {
        // X é contado na resolução (Kaza é um Wizard)
        const n = controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && isSubtype(c.g, id, 'Wizard')).length;
        // CR 601.2f: só a próxima instantânea ou feitiço que você conjurar neste turno (cartas/saque.ts)
        ruleEffect(c, PROXIMA_MAIS_BARATA.id!, { kind: 'endOfTurn' }, { params: { player: c.you, n, desde: c.g.state.turnStats[c.you]?.instantSorceryCast ?? 0 } });
      }, { text: '{T}: A próxima mágica instantânea ou de feitiço que você conjurar neste turno custa {X} a menos, onde X é o número de Wizards que você controla quando esta habilidade resolve.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 601.2f — a redução entra no custo total; o valor de mana não muda (motor/stack.ts totalSpellCost)',
    2: 'teste: reduz só o genérico, e só a próxima instantânea ou feitiço',
  },
});
