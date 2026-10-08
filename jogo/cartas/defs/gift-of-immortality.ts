// Gift of Immortality
// Enchant creature
// When enchanted creature dies, return that card to the battlefield under its owner's control. Return this card to the
// battlefield attached to that creature at the beginning of the next end step.
import { defineAbility, defineCard, delayed, nextEndStepTrigger, on, putOntoBattlefield, t, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const VOLTA = defineAbility('Gift of Immortality:volta', nextEndStepTrigger(function* (c) {
  const aura = c.data.aura as ObjId;
  const criatura = c.data.criatura as ObjId;
  const o = c.g.state.objects[aura];
  // ruling 2: se a criatura não está mais no campo, a Aura fica no cemitério
  if (o?.zone !== 'graveyard' || c.g.state.objects[criatura]?.zone !== 'battlefield') return;
  yield* putOntoBattlefield(c.g, [{ id: aura, controller: o.owner, attachTo: criatura }], 'effect');
}, 'No início da próxima etapa final, devolva Gift of Immortality ao campo anexada àquela criatura.'));

export default defineCard({
  name: 'Gift of Immortality',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      triggered(on.dies((c, _l, o) => c.obj.attachedTo === o.id), function* (c) {
        // ruling 1: ficha não volta (deixa de existir) — nem a Aura
        const carta = c.g.state.lki[c.event.old as number]?.newId ?? null;
        const o = carta !== null ? c.g.state.objects[carta] : undefined;
        if (carta === null || !o || o.zone !== 'graveyard' || o.isToken) return;
        const [nova] = yield* putOntoBattlefield(c.g, [{ id: carta, controller: o.owner }], 'effect');
        const aura = c.g.state.lki[c.source]?.newId ?? null;
        if (nova !== undefined && aura !== null) delayed(c, VOLTA.id!, { data: { aura, criatura: nova } });
      }, { text: 'Quando a criatura encantada morre, devolva aquela carta ao campo sob o controle do dono. Devolva esta carta ao campo anexada àquela criatura no início da próxima etapa final.' }),
    ],
  }],
  rulings: {
    1: 'teste: ficha não volta, nem a Aura',
    2: 'teste: sem a criatura no campo, a Aura fica no cemitério',
  },
});
