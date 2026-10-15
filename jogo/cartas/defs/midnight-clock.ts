// Midnight Clock
// {T}: Add {U}.
// {2}{U}: Put an hour counter on this artifact.
// At the beginning of each upkeep, put an hour counter on this artifact.
// When the twelfth hour counter is put on this artifact, shuffle your hand and graveyard into your library, then draw
// seven cards. Exile this artifact.
import { activated, addCounters, defineCard, draw, exile, mana, moveObjects, on, shuffleLibrary, triggered } from '../../motor/api.ts';

const HORA = 'hour';

export default defineCard({
  name: 'Midnight Clock',
  faces: [{
    abilities: [
      mana('U'),
      activated('{2}{U}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, HORA, 1, c.you);
      }, { text: '{2}{U}: Coloque um marcador de hora neste artefato.' }),
      // ruling 4: na manutenção de cada jogador, não só na sua
      triggered(on.upkeep('each'), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, HORA, 1, c.you);
      }, { text: 'No início de cada manutenção, coloque um marcador de hora neste artefato.' }),
      // ruling 3: dispara quando passa de menos de doze para doze ou mais marcadores
      triggered(on.custom((e, c) => {
        if (e.type !== 'counters' || e.kind !== HORA || e.target.kind !== 'obj' || e.target.id !== c.source || e.amount <= 0) return false;
        const agora = c.g.state.objects[c.source]?.counters[HORA] ?? 0;
        return agora >= 12 && agora - e.amount < 12;
      }), function* (c) {
        const s = c.g.state;
        const cartas = [...s.zones.hand[c.you], ...s.zones.graveyard[c.you]];
        if (cartas.length) yield* moveObjects(c.g, cartas.map((id) => ({ id, to: 'library' as const })), 'shuffle');
        shuffleLibrary(c.g, c.you);
        yield* draw(c.g, c.you, 7);
        // ruling 1: se o artefato já saiu do campo, ele não é exilado
        if (c.g.state.objects[c.source]?.zone === 'battlefield') yield* exile(c.g, [c.source]);
      }, { text: 'Quando o décimo segundo marcador de hora for colocado neste artefato, embaralhe sua mão e seu cemitério no seu grimório e depois compre sete cartas. Exile este artefato.' }),
    ],
  }],
  rulings: {
    1: 'teste: se o artefato já saiu do campo quando o gatilho resolve, ele não é exilado',
    2: 'teste: a mana do próprio relógio ajuda a pagar {2}{U}',
    3: 'teste: no décimo segundo marcador, embaralha mão e cemitério no grimório, compra sete e é exilado',
    4: 'teste: ganha um marcador na manutenção de cada jogador',
  },
});
