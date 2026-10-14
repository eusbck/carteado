// Heartless Conscription
// Exile all creatures. For each card exiled this way, you may play that card for as long as it remains exiled, and mana
// of any type can be spent to cast that spell. Exile Heartless Conscription.
import { allCreatures, allowPlay, defineCard, exile, moveObjects } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { ROUBO } from '../roubo.ts';

export default defineCard({
  name: 'Heartless Conscription',
  faces: [{
    spell: {
      *effect(c) {
        const g = c.g;
        const exiladas = (yield* exile(g, allCreatures(g))).filter((id): id is ObjId => id !== null && id !== undefined && g.state.objects[id]?.zone === 'exile');
        // fichas deixam de existir (CR 111.7); só as cartas ficam com a permissão
        const cartas = exiladas.filter((id) => !g.state.objects[id].isToken);
        allowPlay(g, c.you, c.source, cartas, { kind: 'permanent' }, { anyType: true });
        // "Exile Heartless Conscription": vai da pilha para o exílio em vez do cemitério (CR 608.2n)
        if (g.state.objects[c.source]?.zone === 'stack') yield* moveObjects(g, [{ id: c.source, to: 'exile' }], 'effect');
      },
    },
  }],
  rulings: {
    1: ROUBO.tempo,
    2: 'teste: uma carta de terreno exilada assim se joga como terreno',
  },
});
