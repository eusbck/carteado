// Scroll Rack
// {1}, {T}: Exile any number of cards from your hand face down. Put that many cards from the top of your library into
// your hand. Then look at the exiled cards and put them on top of your library in any order.
import { activated, chooseItems, defineCard, exile, moveObjects, nameOf, printedChars } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Scroll Rack',
  faces: [{
    abilities: [
      activated('{1}, {T}', function* (c) {
        const g = c.g;
        const s = g.state;
        const mao = [...s.zones.hand[c.you]];
        if (!mao.length) return;
        const esc = (yield* chooseItems(g, c.you, 'Scroll Rack: escolha as cartas da mão para exilar viradas para baixo', mao.map((id) => ({ id: String(id), label: nameOf(g, id), obj: id, card: { def: s.objects[id].def } })), 0, mao.length)).map(Number);
        if (!esc.length) return;
        const exiladas = (yield* exile(g, esc, { faceDown: true })).filter((x): x is ObjId => x !== null && x !== undefined && s.objects[x]?.zone === 'exile');
        // ruling 1: não é comprar; pega só o que houver no grimório
        const topo = s.zones.library[c.you].slice(0, exiladas.length);
        if (topo.length) yield* moveObjects(g, topo.map((id) => ({ id, to: 'hand' as const })), 'effect');
        if (!exiladas.length) return;
        // CR 401.4: você escolhe a ordem; a primeira escolhida fica no topo (viradas para baixo: o nome vem da carta impressa)
        for (const id of exiladas) s.objects[id].visibleTo = [c.you];
        const ordem = exiladas.length < 2 ? exiladas : (yield* chooseItems(g, c.you, 'Scroll Rack: ponha as cartas exiladas no topo do grimório (a primeira escolhida fica no topo)', exiladas.map((id) => ({ id: String(id), label: printedChars(s.objects[id].def, 0, s.objects[id].owner).name, obj: id, card: { def: s.objects[id].def } })), exiladas.length, exiladas.length, true)).map(Number);
        yield* moveObjects(g, [...ordem].reverse().map((id) => ({ id, to: 'library' as const, position: 'top' as const })), 'effect');
      }, { text: '{1}, {T}: Exile qualquer número de cartas da sua mão viradas para baixo. Coloque o mesmo número de cartas do topo do seu grimório na sua mão. Depois olhe as cartas exiladas e coloque-as no topo do seu grimório em qualquer ordem.' }),
    ],
  }],
  rulings: { 1: 'teste: com o grimório curto, pega só as cartas que houver, sem perder o jogo' },
});
