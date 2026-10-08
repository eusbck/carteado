// Ghoulish Impetus
// Enchant creature
// Enchanted creature gets +1/+1, has deathtouch, and is goaded. (It attacks each combat if able and attacks a player
// other than you if able.)
// When enchanted creature dies, return this card to the battlefield at the beginning of the next end step.
import { attachedGets, defineAbility, defineCard, delayed, goadsEnchanted, nextEndStepTrigger, on, putOntoBattlefield, t, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const VOLTA = defineAbility('Ghoulish Impetus:volta', nextEndStepTrigger(function* (c) {
  const carta = c.data.carta as ObjId;
  const o = c.g.state.objects[carta];
  // volta ao campo sob o controle do dono; escolhe o que encantar ao entrar (CR 303.4f)
  if (o?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id: carta, controller: o.owner }], 'effect');
}, 'No início da próxima etapa final, devolva Ghoulish Impetus ao campo.'));

export default defineCard({
  name: 'Ghoulish Impetus',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'deathtouch' }], 'A criatura encantada recebe +1/+1 e tem toque mortífero.'),
      // rulings 1-4: goad pelo controlador da Aura (motor: exigências de ataque, CR 701.15b)
      goadsEnchanted(),
      triggered(on.dies((c, _l, o) => c.obj.attachedTo === o.id), function* (c) {
        const carta = c.g.state.lki[c.source]?.newId ?? null;
        if (carta !== null) delayed(c, VOLTA.id!, { data: { carta } });
      }, { text: 'Quando a criatura encantada morre, devolva esta carta ao campo no início da próxima etapa final.' }),
    ],
  }],
  rulings: {
    1: 'teste: a criatura goadada precisa atacar outro jogador',
    2: 'regra geral: CR 508.1d — virada ou impedida, não ataca; custo não é obrigatório',
    3: 'regra geral: CR 701.15b — maior número de exigências cumpridas',
    4: 'regra geral: CR 701.15 — goad não é habilidade da criatura',
  },
});
