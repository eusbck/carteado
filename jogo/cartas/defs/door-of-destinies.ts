// Door of Destinies
// As this artifact enters, choose a creature type.
// Whenever you cast a spell of the chosen type, put a charge counter on this artifact.
// Creatures you control of the chosen type get +1/+1 for each charge counter on this artifact.
import { addCounters, and, anthem, asEnters, chars, chooseCreatureType, defineCard, is, on, triggered } from '../../motor/api.ts';
import { tipoEscolhido } from '../vingadores.ts';

export default defineCard({
  name: 'Door of Destinies',
  faces: [{
    abilities: [
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, c.you, 'Door of Destinies: escolha um tipo de criatura');
      }, 'Conforme este artefato entra, escolha um tipo de criatura.'),
      // ruling 2: o marcador entra antes de a mágica resolver, então a criatura já entra com o bônus
      triggered(on.youCast((c, id) => { const tipo = tipoEscolhido(c); return !!tipo && chars(c.g, id).subtypes.includes(tipo); }), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'charge', 1, c.you);
      }, { text: 'Sempre que você conjura uma mágica do tipo escolhido, coloque um marcador de carga neste artefato.' }),
      anthem(and(is.creature, is.yours, (c, id) => { const tipo = tipoEscolhido(c); return !!tipo && chars(c.g, id).subtypes.includes(tipo); }), (c) => {
        const n = c.g.state.objects[c.source]?.counters.charge ?? 0;
        return n > 0 ? [{ k: 'pt', p: n, t: n }] : [];
      }, 'As criaturas do tipo escolhido que você controla recebem +1/+1 para cada marcador de carga neste artefato.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 205.3m — a criatura com mais de um tipo conta se um deles for o escolhido (cartas/defs/door-of-destinies.ts)',
    2: 'teste: conjurar uma mágica do tipo escolhido põe um marcador de carga; a criatura já entra com o bônus',
  },
});