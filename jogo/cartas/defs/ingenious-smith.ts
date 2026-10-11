// Ingenious Smith
// When this creature enters, look at the top four cards of your library. You may reveal an artifact card from among
// them and put it into your hand. Put the rest on the bottom of your library in a random order.
// Whenever one or more artifacts you control enter, put a +1/+1 counter on this creature. This ability triggers only
// once each turn.
import { addCounters, and, chooseItems, defineCard, etb, is, isType, moveObjects, nameOf, objItem, on, triggered } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';

export default defineCard({
  name: 'Ingenious Smith',
  faces: [{
    abilities: [
      etb(function* (c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 4);
        if (!topo.length) return;
        const itens = topo.map((id) => ({ ...objItem(c.g, id, nameOf(c.g, id)), card: { def: s.objects[id].def }, disabled: !isType(c.g, id, 'Artifact') }));
        const esc = yield* chooseItems(c.g, c.you, 'Ingenious Smith: você pode revelar uma carta de artefato entre as quatro do topo e colocá-la na mão', itens, 0, 1);
        const escolhida = esc.length ? Number(esc[0]) : null;
        if (escolhida !== null) {
          c.g.log(`${s.players[c.you].name} revela ${nameOf(c.g, escolhida)}.`, { rule: '701.20' });
          yield* moveObjects(c.g, [{ id: escolhida, to: 'hand' }], 'effect');
        }
        const resto = shuffle(s.rng, topo.filter((id) => id !== escolhida && s.objects[id]?.zone === 'library'));
        s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !resto.includes(id)), ...resto];
        c.g.bump();
      }, { text: 'Quando esta criatura entra, olhe as quatro cartas do topo do seu grimório. Você pode revelar uma carta de artefato entre elas e colocá-la na sua mão. Coloque o resto no fundo do seu grimório em ordem aleatória.' }),
      triggered(on.entersBatch(and(is.artifact, is.yours)), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { oncePerTurn: true, text: 'Sempre que um ou mais artefatos que você controla entram, coloque um marcador +1/+1 nesta criatura. Esta habilidade só dispara uma vez por turno.' }),
    ],
  }],
  rulings: {},
});