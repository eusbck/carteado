// Hercules, Olympian Hero
// Whenever Hercules attacks, put a +1/+1 counter on him. He gains indestructible until end of turn.
// Whenever Hercules is dealt damage for the first time each turn, put that many +1/+1 counters on him. (He must survive
// the damage to get the counters.)
import { addCounters, defineCard, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Hercules, Olympian Hero',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
        untilEndOfTurn(c, [c.source], [{ k: 'addKeyword', kw: 'indestructible' }]);
      }, { text: 'Sempre que Hercules ataca, coloque um marcador +1/+1 nele. Ele ganha indestrutível até o fim do turno.' }),
      // o dano simultâneo é uma vez só: soma o dano do lote; depois disso não dispara mais no turno
      triggered(on.batch((evs, c) => {
        let n = 0;
        for (const e of evs) if (e.type === 'damage' && e.target.kind === 'obj' && e.target.id === c.source) n += e.amount;
        return n > 0 ? { n } : false;
      }), function* (c) {
        // precisa sobreviver ao dano para receber os marcadores
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', Number(c.event.n), c.you);
      }, { oncePerTurn: true, text: 'Sempre que Hercules recebe dano pela primeira vez em cada turno, coloque essa quantidade de marcadores +1/+1 nele.' }),
    ],
  }],
  rulings: {},
});