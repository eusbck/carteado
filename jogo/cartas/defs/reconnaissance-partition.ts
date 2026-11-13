// Reconnaissance Partition
// This creature enters with two charge counters on it.
// {T}, Remove a counter from this creature: Choose one —
// • Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.
// • Draw a card.
import { activated, chooseItems, defineCard, draw, entersWithCounters, fetchBasicToBattlefield, modal, removeCounters } from '../../motor/api.ts';

export default defineCard({
  name: 'Reconnaissance Partition',
  faces: [{
    abilities: [
      entersWithCounters('charge', 2),
      // "remova um marcador" (de qualquer tipo): se houver mais de um tipo, o controlador escolhe qual (CR 122)
      activated([{ k: 'tap' }, {
        k: 'custom', label: 'remover um marcador desta criatura',
        canPay: (c) => Object.values(c.g.state.objects[c.source]?.counters ?? {}).some((n) => n > 0),
        *pay(c) {
          const cs = c.g.state.objects[c.source]?.counters ?? {};
          const tipos = Object.keys(cs).filter((k) => cs[k] > 0);
          if (!tipos.length) return false;
          const [tipo] = tipos.length === 1 ? tipos : yield* chooseItems(c.g, c.you, 'Remova um marcador desta criatura: escolha o tipo', tipos.map((k) => ({ id: k, label: k })), 1, 1);
          removeCounters(c.g, { kind: 'obj', id: c.source }, tipo, 1);
          return { removedCounter: tipo };
        },
      }], function* () {}, {
        modes: modal(1, 1, [
          { text: 'Procure no seu grimório uma carta de terreno básico, coloque-a no campo virada e depois embaralhe.', *effect(c) { yield* fetchBasicToBattlefield(c, 1, { tapped: true }); } },
          { text: 'Compre uma carta.', *effect(c) { yield* draw(c.g, c.you, 1); } },
        ]),
        text: '{T}, Remova um marcador desta criatura: Escolha um — • Procure no seu grimório uma carta de terreno básico, coloque-a no campo virada e depois embaralhe. • Compre uma carta.',
      }),
    ],
  }],
  rulings: {},
});
