// Roaming Throne
// Ward {2}
// As this creature enters, choose a creature type.
// This creature is the chosen type in addition to its other types.
// If a triggered ability of another creature you control of the chosen type triggers, it triggers an additional time.
import { asEnters, chars, chooseCreatureType, controllerOf, defineCard, isCreature, selfGets, staticAbility, ward } from '../../motor/api.ts';
import { tipoEscolhido } from '../vingadores.ts';

export default defineCard({
  name: 'Roaming Throne',
  faces: [{
    abilities: [
      ...ward('{2}'),
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, c.you, 'Roaming Throne: escolha um tipo de criatura');
      }, 'Conforme esta criatura entra, escolha um tipo de criatura.'),
      selfGets((c) => { const tipo = tipoEscolhido(c); return tipo ? [{ k: 'addTypes', subtypes: [tipo] }] : [{ k: 'addTypes', subtypes: [] }]; },
        'Esta criatura é do tipo escolhido além dos outros tipos.'),
      staticAbility({
        rules: {
          extraTriggers: (c, tr) => {
            const tipo = tipoEscolhido(c);
            const s = c.g.state;
            if (!tipo || tr.source === c.source || s.objects[tr.source]?.zone !== 'battlefield') return 0;
            if (controllerOf(c.g, tr.source) !== c.you || !isCreature(c.g, tr.source)) return 0;
            return chars(c.g, tr.source).subtypes.includes(tipo) ? 1 : 0;
          },
        },
        text: 'Se uma habilidade desencadeada de outra criatura do tipo escolhido que você controla disparar, ela dispara uma vez a mais.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.2 — só vale para habilidades de criaturas no campo; não afeta habilidades de "quando morre" que olham para trás',
    2: 'regra geral: CR 603.2c — cada Roaming Throne soma um disparo',
  },
});
