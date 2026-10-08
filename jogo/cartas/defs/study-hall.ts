// Study Hall
// {T}: Add {C}.
// {1}, {T}: Add one mana of any color. When you spend this mana to cast your commander, scry X, where X is the number of
// times it's been cast from the command zone this game.
import { defineAbility, defineCard, lookAndArrange, mana, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const VIDENCIA = defineAbility('Study Hall:videncia', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const o = c.g.state.objects[c.event.spell as ObjId] ?? c.g.state.lki[c.event.spell as ObjId]?.obj;
  // X conta esta conjuração, se ela veio da zona de comando (CR 903.8)
  const x = o?.card != null ? c.g.state.players[c.you].commanderCasts[String(o.card)] ?? 0 : 0;
  if (x > 0) yield* lookAndArrange(c.g, c.you, x, 'scry');
}, {
  condition: (c) => {
    const s = c.g.state;
    const o = s.objects[c.event.spell as ObjId] ?? s.lki[c.event.spell as ObjId]?.obj;
    return !!o && o.card != null && o.owner === c.you && s.cards[o.card].isCommander;
  },
  text: 'Quando você gastar essa mana para conjurar seu comandante, vidência X, onde X é o número de vezes que ele foi conjurado da zona de comando nesta partida.',
}));

export default defineCard({
  name: 'Study Hall',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana('any', { cost: '{1}, {T}', onSpend: VIDENCIA.id!, text: '{1}, {T}: Adicione uma mana de qualquer cor. Quando você gastar essa mana para conjurar seu comandante, vidência X.' }),
    ],
  }],
});
