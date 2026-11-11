// Roaming Throne
// Ward {2}
// As this creature enters, choose a creature type.
// This creature is the chosen type in addition to its other types.
// If a triggered ability of another creature you control of the chosen type triggers, it triggers an additional time.
import { asEnters, chooseCreatureType, controllerOf, defineCard, lkiChars, selfGets, staticAbility, ward } from '../../motor/api.ts';
import { tipoEscolhido } from '../vingadores.ts';

export default defineCard({
  name: 'Roaming Throne',
  faces: [{
    abilities: [
      ...ward('{2}'),
      // CR 614.12: o tipo é escolhido antes de entrar
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, ev.controller, 'Roaming Throne: escolha um tipo de criatura');
      }, 'Conforme esta criatura entra, escolha um tipo de criatura.'),
      selfGets((c) => { const tipo = tipoEscolhido(c); return tipo ? [{ k: 'addTypes', subtypes: [tipo] }] : []; }, 'Esta criatura é do tipo escolhido, além dos outros tipos.'),
      // ruling 1: dispara uma vez a mais (não é cópia); cada instância escolhe seus alvos. Ruling 2: cada Roaming Throne
      // com o mesmo tipo soma uma vez. A fonte que saiu do campo (gatilho de morrer) é vista pela última informação
      staticAbility({
        rules: {
          extraTriggers: (c, t) => {
            const tipo = tipoEscolhido(c);
            if (!tipo || t.source === c.source || t.controller !== c.you) return 0;
            const ch = lkiChars(c.g, t.source);
            if (!ch || !ch.types.includes('Creature') || !ch.subtypes.includes(tipo)) return 0;
            const naMesa = c.g.state.objects[t.source]?.zone === 'battlefield';
            if (naMesa && controllerOf(c.g, t.source) !== c.you) return 0;
            if (!naMesa && ch.controller !== c.you) return 0;
            return 1;
          },
        },
        text: 'Se uma habilidade desencadeada de outra criatura do tipo escolhido que você controla disparar, ela dispara uma vez a mais.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: o gatilho de entrar de uma criatura do tipo escolhido dispara duas vezes',
    2: 'teste: dois Roaming Thrones com o mesmo tipo fazem o gatilho disparar três vezes',
  },
});
