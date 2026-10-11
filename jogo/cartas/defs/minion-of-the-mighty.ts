// Minion of the Mighty
// Menace
// Pack tactics — Whenever this creature attacks, if you attacked with creatures with total power 6 or greater this
// combat, you may put a Dragon creature card from your hand onto the battlefield tapped and attacking.
import { chars, chooseItems, controllerOf, defineCard, isCreature, keyword, nameOf, objItem, on, playerItem, power, putOntoBattlefield, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/api.ts';
import type { PlayerId, TargetRef } from '../../motor/types.ts';

/** força total das criaturas com que o jogador atacou neste combate (palavra de habilidade "pack tactics", CR 207.2c) */
function forcaDoAtaque(g: G, p: PlayerId): number {
  const cb = g.state.combat;
  if (!cb) return 0;
  return cb.attackers.filter((a) => !a.removed && g.state.objects[a.id]?.zone === 'battlefield' && controllerOf(g, a.id) === p).reduce((s, a) => s + power(g, a.id), 0);
}

export default defineCard({
  name: 'Minion of the Mighty',
  faces: [{
    abilities: [
      keyword('menace'),
      triggered(on.selfAttacks(), function* (c) {
        const g = c.g;
        const s = g.state;
        // ruling 1: carta de criatura Dragon é a que tem o tipo de criatura Dragon
        const dragoes = s.zones.hand[c.you].filter((id) => isCreature(g, id) && chars(g, id).subtypes.includes('Dragon'));
        if (!dragoes.length) return;
        const esc = yield* chooseItems(g, c.you, 'Minion of the Mighty: você pode pôr uma carta de criatura Dragon da sua mão no campo, virada e atacando', dragoes.map((id) => ({ ...objItem(g, id, nameOf(g, id)), card: { def: s.objects[id].def } })), 0, 1);
        if (!esc.length) return;
        // ruling 2 (CR 508.4): você escolhe quem o Dragon ataca; não precisa ser o mesmo jogador
        const alvos: { item: ReturnType<typeof playerItem>; ref: TargetRef }[] = [];
        for (const p of g.opponents(c.you)) {
          alvos.push({ item: { ...playerItem(g, p), id: `j${p}` }, ref: { kind: 'player', id: p } });
          for (const id of s.zones.battlefield) if (!s.objects[id].phasedOut && controllerOf(g, id) === p && chars(g, id).types.includes('Planeswalker')) alvos.push({ item: { ...objItem(g, id, nameOf(g, id)), id: `o${id}` }, ref: { kind: 'obj', id } });
        }
        if (!alvos.length) return;
        const [qual] = alvos.length === 1 ? [alvos[0].item.id] : yield* chooseItems(g, c.you, 'Minion of the Mighty: o Dragon entra atacando quem?', alvos.map((a) => a.item), 1, 1);
        const alvo = alvos.find((a) => a.item.id === qual)!.ref;
        // ruling 3: já entra virado e atacando; não foi declarado atacante, então "sempre que ataca" não dispara
        yield* putOntoBattlefield(g, [{ id: Number(esc[0]), controller: c.you, tapped: true, attacking: alvo }], 'effect');
      }, {
        // CR 603.4: cláusula "se" interveniente, conferida ao disparar e ao resolver
        condition: (c) => forcaDoAtaque(c.g, c.you) >= 6,
        text: 'Tática de matilha — Sempre que esta criatura ataca, se você atacou com criaturas com força total 6 ou mais neste combate, você pode colocar uma carta de criatura Dragon da sua mão no campo de batalha, virada e atacando.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: só uma carta de criatura Dragon da mão pode ser escolhida',
    2: 'teste: com mais de um oponente, você escolhe quem o Dragon ataca',
    3: 'teste: com força total 6 ou mais, põe um Dragon da mão virado e atacando, sem disparar "sempre que ataca"',
  },
});
