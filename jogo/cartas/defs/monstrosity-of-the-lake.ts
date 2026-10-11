// Monstrosity of the Lake
// When Monstrosity of the Lake enters, you may pay {5}. If you do, tap all creatures your opponents control, then put a
// stun counter on each of those creatures. (If a permanent with a stun counter would become untapped, remove one from it
// instead.)
// Islandcycling {2} ({2}, Discard this card: Search your library for an Island card, reveal it, put it into your hand,
// then shuffle.)
import { addCounters, allCreatures, controllerOf, defineCard, etb, mayPay, tap, typecycling } from '../../motor/api.ts';

export default defineCard({
  name: 'Monstrosity of the Lake',
  faces: [{
    abilities: [
      etb(function* (c) {
        if (!(yield* mayPay(c, c.you, '{5}', 'virar todas as criaturas dos oponentes e pôr um marcador de atordoamento em cada uma'))) return;
        const ids = allCreatures(c.g).filter((id) => c.g.isOpponent(c.you, controllerOf(c.g, id)));
        for (const id of ids) tap(c.g, id);
        // CR 122.1d: o marcador de atordoamento troca a próxima vez que o permanente desviraria
        for (const id of ids) addCounters(c.g, { kind: 'obj', id }, 'stun', 1, c.you);
      }, { text: 'Quando Monstrosity of the Lake entra, você pode pagar {5}. Se fizer isso, vire todas as criaturas que os seus oponentes controlam e depois coloque um marcador de atordoamento em cada uma delas.' }),
      // CR 702.29e
      typecycling('Island', '{2}'),
    ],
  }],
  rulings: {
    1: 'teste: ciclagem de ilha {2}: descarta e busca uma carta de Island',
    2: 'regra geral: CR 702.29e — a ciclagem de tipo é uma ciclagem: o que dispara ou proíbe ciclar vale para ela (motor/criaturas.ts typecycling)',
  },
});
