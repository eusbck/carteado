// Glorious Purpose
// Whenever a creature you control connives, put a +1/+1 counter on that creature and a plan counter on this enchantment.
// When the sixth plan counter is put on this enchantment, sacrifice it. If you do, exile the top four cards of your
// library. You may cast any number of spells from among them without paying their mana costs. Put the rest into your
// hand.
import { addCounters, chooseItems, defineCard, exile, isLand, mayCastFree, moveObjects, nameOf, objItem, on, onYouConnive, sacrifice, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Glorious Purpose',
  faces: [{
    abilities: [
      triggered(onYouConnive(), function* (c) {
        const criatura = c.event.criatura as ObjId;
        if (c.g.state.objects[criatura]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: criatura }, '+1/+1', 1, c.you);
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'plan', 1, c.you);
      }, { text: 'Sempre que uma criatura que você controla trama, coloque um marcador +1/+1 nela e um marcador de plano neste encantamento.' }),
      // dispara quando o total passa de menos de seis para seis ou mais
      triggered(on.custom((e, c) => {
        if (e.type !== 'counters' || e.kind !== 'plan' || e.target.kind !== 'obj' || e.target.id !== c.source) return false;
        const agora = c.g.state.objects[c.source]?.counters.plan ?? 0;
        return agora - e.amount < 6 && agora >= 6;
      }), function* (c) {
        const s = c.g.state;
        if (s.objects[c.source]?.zone !== 'battlefield') return;
        const [ok] = yield* sacrifice(c.g, [c.source]);
        if (ok === null || ok === undefined) return;
        const exiladas = (yield* exile(c.g, s.zones.library[c.you].slice(0, 4))).filter((x): x is ObjId => x !== null && s.objects[x]?.zone === 'exile');
        // conjura quantas quiser, uma de cada vez (CR 608.2g); terrenos não são mágicas e vão para a mão
        let restam = exiladas.filter((id) => !isLand(c.g, id));
        while (restam.length) {
          const [esc] = yield* chooseItems(c.g, c.you, 'Glorious Purpose: conjurar uma das cartas exiladas sem pagar o custo de mana?', [{ id: '', label: 'Não conjurar mais nenhuma' }, ...restam.map((id) => objItem(c.g, id, nameOf(c.g, id)))], 1, 1);
          if (!esc) break;
          const id = Number(esc);
          restam = restam.filter((x) => x !== id);
          yield* mayCastFree(c.g, c.you, id, `Conjurar ${nameOf(c.g, id)} sem pagar o custo de mana?`);
        }
        const paraMao = exiladas.filter((id) => s.objects[id]?.zone === 'exile');
        if (paraMao.length) yield* moveObjects(c.g, paraMao.map((id) => ({ id, to: 'hand' as const })), 'effect');
      }, { text: 'Quando o sexto marcador de plano for colocado neste encantamento, sacrifique-o. Se fizer isso, exile as quatro cartas do topo do seu grimório. Você pode conjurar qualquer número de mágicas dentre elas sem pagar os custos de mana. Coloque o resto na sua mão.' }),
    ],
  }],
  rulings: {},
});
