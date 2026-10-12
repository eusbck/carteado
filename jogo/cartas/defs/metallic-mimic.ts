// Metallic Mimic
// As this creature enters, choose a creature type.
// This creature is the chosen type in addition to its other types.
// Each other creature you control of the chosen type enters with an additional +1/+1 counter on it.
import { anthem, asEnters, chooseCreatureType, defineCard, staticAbility } from '../../motor/api.ts';
import { tipoEscolhido } from '../vingadores.ts';

export default defineCard({
  name: 'Metallic Mimic',
  faces: [{
    abilities: [
      // ruling 1: escolhido antes de entrar, sem resposta; ruling 3: só tipos de criatura existentes
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, c.you, 'Metallic Mimic: escolha um tipo de criatura');
      }, 'Conforme esta criatura entra, escolha um tipo de criatura.'),
      anthem((c, id) => id === c.source, (c) => { const tipo = tipoEscolhido(c); return tipo ? [{ k: 'addTypes', subtypes: [tipo] }] : []; }, 'Esta criatura é do tipo escolhido além dos outros tipos dela.'),
      // CR 614.12: olha as características com que a criatura entraria (ruling 2); as que entram junto com o Mimic não
      // ganham nada, porque ele ainda não está no campo (ruling 4)
      staticAbility({
        rules: {
          enterModifier: (c, ev, vaiSer) => {
            const tipo = tipoEscolhido(c);
            if (!tipo || ev.controller !== c.you || ev.obj === c.source || !vaiSer.types.includes('Creature') || !vaiSer.subtypes.includes(tipo)) return;
            ev.counters['+1/+1'] = (ev.counters['+1/+1'] ?? 0) + 1;
          },
        },
        text: 'Cada outra criatura do tipo escolhido que você controla entra com um marcador +1/+1 adicional.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 614.12 — o tipo é escolhido antes de entrar, sem resposta, e já vale ao entrar (motor/actions.ts putOntoBattlefield)',
    2: 'teste: é do tipo escolhido; outra criatura sua desse tipo entra com um marcador +1/+1 a mais, as de outro tipo não',
    3: 'regra geral: CR 205.3m — só tipos de criatura existentes podem ser escolhidos (motor/efeitos.ts chooseCreatureType)',
    4: 'regra geral: CR 614.12 — as criaturas que entram ao mesmo tempo que o Mimic não recebem o marcador (motor/actions.ts putOntoBattlefield)',
  },
});