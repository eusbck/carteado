// Captain Marvel, Apex Avenger
// Flying, double strike, indestructible
// Whenever you put one or more counters on another creature, if it's not a Kree, you may put the same number and kind of
// counters on Captain Marvel.
import { addCounters, chars, defineCard, isCreature, keywords, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Captain Marvel, Apex Avenger',
  faces: [{
    abilities: [
      ...keywords('flying', 'double strike', 'indestructible'),
      triggered(on.custom((e, c) => (e.type === 'counters' && e.amount > 0 && e.by === c.you && e.target.kind === 'obj' && e.target.id !== c.source && !!c.g.state.objects[e.target.id]
        && c.g.state.objects[e.target.id].zone === 'battlefield' && isCreature(c.g, e.target.id) ? { criatura: e.target.id, tipo: e.kind, n: e.amount } : false)), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        const n = Number(c.event.n);
        const tipo = String(c.event.tipo);
        if (yield* yesNo(c.g, c.you, `Captain Marvel: colocar ${n} marcador(es) ${tipo} nela também?`)) addCounters(c.g, { kind: 'obj', id: c.source }, tipo, n, c.you);
      }, {
        // CR 603.4: "se ela não for Kree"; vale a última informação se a criatura já saiu do campo
        condition: (c) => { const id = c.event.criatura as number; const ch = c.g.state.objects[id] ? chars(c.g, id) : c.g.state.lki[id]?.chars; return !!ch && !ch.subtypes.includes('Kree'); },
        text: 'Sempre que você coloca um ou mais marcadores em outra criatura, se ela não for Kree, você pode colocar o mesmo número e tipo de marcadores em Captain Marvel.',
      }),
    ],
  }],
  rulings: {},
});