// Cloud, Midgar Mercenary
// When Cloud enters, search your library for an Equipment card, reveal it, put it into your hand, then shuffle.
// As long as Cloud is equipped, if a triggered ability of Cloud or an Equipment attached to it triggers, that ability
// triggers an additional time.
import { chars, defineCard, etb, isSubtype, searchTo, staticAbility } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';

/** Equipamentos anexados a esta permanente */
function equipamentosEm(g: G, id: number): number[] {
  return g.state.zones.battlefield.filter((x) => g.state.objects[x].attachedTo === id && chars(g, x).subtypes.includes('Equipment'));
}

export default defineCard({
  name: 'Cloud, Midgar Mercenary',
  faces: [{
    abilities: [
      etb(function* (c) {
        yield* searchTo(c, c.you, (id) => isSubtype(c.g, id, 'Equipment'), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de Equipamento' });
      }, { text: 'Quando Cloud entra, procure no seu grimório uma carta de Equipamento, revele-a, coloque-a na sua mão e depois embaralhe.' }),
      // ruling 4: não copia a habilidade; ela dispara de novo, com as escolhas feitas para cada instância
      staticAbility({
        rules: {
          extraTriggers: (c, tr) => {
            if (c.g.state.objects[c.source]?.zone !== 'battlefield') return 0;
            const eqs = equipamentosEm(c.g, c.source);
            if (!eqs.length) return 0;
            return tr.source === c.source || eqs.includes(tr.source) ? 1 : 0;
          },
        },
        text: 'Enquanto Cloud estiver equipado, se uma habilidade desencadeada de Cloud ou de um Equipamento anexado a ele disparar, essa habilidade dispara uma vez a mais.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 607.2 — as instâncias a mais continuam ligadas à mesma segunda habilidade (motor/triggers.ts)',
    2: 'regra geral: CR 603.1 — habilidades desencadeadas são as de "quando", "sempre que" e "no início" (motor/triggers.ts)',
    3: 'regra geral: CR 607.3 — com mais de uma resposta para "a carta exilada", valem todas, e os valores se somam (motor/criaturas.ts linkedExiled)',
    4: 'teste: equipado, os gatilhos de Cloud e dos Equipamentos anexados a ele disparam uma vez a mais',
  },
});