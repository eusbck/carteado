// Chitterspitter
// At the beginning of your upkeep, you may sacrifice a token. If you do, put an acorn counter on this artifact.
// Squirrels you control get +1/+1 for each acorn counter on this artifact.
// {G}, {T}: Create a 1/1 green Squirrel creature token.
import { activated, addCounters, anthem, and, chooseItems, createTokens, defineCard, is, nameOf, objItem, on, sacrifice, triggered } from '../../motor/api.ts';
import { fichasDe } from '../esquilos.ts';

export default defineCard({
  name: 'Chitterspitter',
  faces: [{
    abilities: [
      triggered(on.upkeep('you'), function* (c) {
        const fichas = fichasDe(c.g, c.you);
        if (!fichas.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Chitterspitter: sacrificar uma ficha para pôr um marcador de bolota?',
          [{ id: 'nao', label: 'Não sacrificar' }, ...fichas.map((id) => objItem(c.g, id, nameOf(c.g, id)))], 1, 1);
        if (esc === 'nao') return;
        const [foi] = yield* sacrifice(c.g, [Number(esc)]);
        if (foi !== null && foi !== undefined && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'acorn', 1, c.you);
      }, { text: 'No início da sua manutenção, você pode sacrificar uma ficha. Se fizer isso, coloque um marcador de bolota neste artefato.' }),
      anthem(and(is.creature, is.subtype('Squirrel'), is.yours), (c) => {
        const n = c.g.state.objects[c.source]?.counters.acorn ?? 0;
        return n > 0 ? [{ k: 'pt', p: n, t: n }] : [];
      }, 'Os Squirrels que você controla recebem +1/+1 para cada marcador de bolota neste artefato.'),
      activated('{G}, {T}', function* (c) { yield* createTokens(c.g, c.you, 'Squirrel', 1); }, { text: '{G}, {T}: Crie uma ficha de criatura Squirrel verde 1/1.' }),
    ],
  }],
  rulings: {},
});
