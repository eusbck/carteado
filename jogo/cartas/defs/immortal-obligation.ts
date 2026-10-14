// Immortal Obligation
// Return target creature card from an opponent's graveyard to the battlefield under their control with a duty counter
// on it. For as long as that creature has a duty counter on it, it is goaded, can't attack you or a permanent you
// control, and can't block creatures you control.
import { addEffect, controllerOf, defineAbility, defineCard, is, putOntoBattlefield, t, tgt } from '../../motor/api.ts';
import type { SCtx, StaticDef } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';

type Prm = { params?: { obj: ObjId } };
const comDever = (c: SCtx, id: ObjId): boolean => {
  const prm = (c as SCtx & Prm).params;
  return !!prm && prm.obj === id && (c.g.state.objects[id]?.counters.duty ?? 0) > 0;
};

// enquanto a criatura tiver um marcador de dever: goadada por quem conjurou, não ataca nem bloqueia contra ele
const DEVER = defineAbility<StaticDef>('Immortal Obligation:dever', {
  kind: 'static',
  rules: {
    goads: (c, obj) => comDever(c, obj),
    canAttack: (c, atacante, alvo) => !comDever(c, atacante) || (alvo.kind === 'player' ? alvo.id !== c.you : !c.g.state.objects[alvo.id] || controllerOf(c.g, alvo.id) !== c.you),
    canBlock: (c, bloqueador, atacante) => !comDever(c, bloqueador) || controllerOf(c.g, atacante) !== c.you,
  },
});

export default defineCard({
  name: 'Immortal Obligation',
  faces: [{
    spell: {
      targets: [t.card('graveyard', is.creature, 'carta de criatura alvo do cemitério de um oponente', 'opponent')],
      *effect(c) {
        const carta = tgt(c);
        if (carta === null) return;
        const dono = c.g.state.objects[carta].owner;
        const [nova] = yield* putOntoBattlefield(c.g, [{ id: carta, controller: dono, counters: { duty: 1 } }], 'effect');
        if (nova === undefined || c.g.state.objects[nova]?.zone !== 'battlefield') return;
        addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: nova }, affected: null, mods: [{ k: 'rule', id: DEVER.id!, params: { obj: nova } }] });
      },
    },
  }],
  rulings: {},
});
