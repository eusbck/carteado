// Resurrection Orb
// Equipped creature has lifelink.
// Whenever equipped creature dies, return that card to the battlefield under its owner's control at the beginning of the
// next end step.
// Equip {4} ({4}: Attach to target creature you control. Equip only as a sorcery.)
import { attachedGets, defineAbility, defineCard, delayed, equip, nextEndStepTrigger, on, putOntoBattlefield, triggered } from '../../motor/api.ts';

// ruling 1: o gatilho atrasado dispara mesmo que o Orb já tenha saído do campo
const RETORNA = defineAbility('Resurrection Orb:retorna', nextEndStepTrigger(function* (c) {
  const carta = c.data.carta as number;
  const o = c.g.state.objects[carta];
  if (o && o.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id: carta, controller: o.owner }], 'effect');
}, 'Devolva essa carta ao campo de batalha sob o controle do dono no início da próxima etapa final.'));

export default defineCard({
  name: 'Resurrection Orb',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'addKeyword', kw: 'lifelink' }], 'A criatura equipada tem vínculo com a vida.'),
      triggered(on.dies((c, _l, o) => c.obj.attachedTo === o.id), function* (c) {
        const novo = c.g.state.lki[c.event.old as number]?.newId ?? null;
        if (novo !== null && c.g.state.objects[novo]?.zone === 'graveyard') delayed(c, RETORNA.id!, { data: { carta: novo } });
      }, { text: 'Sempre que a criatura equipada morre, devolva essa carta ao campo de batalha sob o controle do dono no início da próxima etapa final.' }),
      equip('{4}'),
    ],
  }],
  rulings: { 1: 'teste: a criatura equipada que morre volta ao campo no início da próxima etapa final, mesmo sem o Orb' },
});