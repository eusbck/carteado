// Janja, Primeira-Dama (carta própria da mesa)
// Aura spells you cast cost {1} less to cast.
// Whenever an Aura you control is put into a graveyard from the battlefield, return it to its owner's hand. This
// ability triggers only once each turn.
import { defineCard, lkiChars, on, returnToHand, staticAbility, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Janja, Primeira-Dama',
  faces: [{
    abilities: [
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.subtypes.includes('Aura') ? { reduce: 1 } : null) },
        text: 'As mágicas de Aura que você conjura custam {1} a menos para serem conjuradas.',
      }),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && !e.token && e.controller === c.you
        && !!lkiChars(c.g, e.old)?.subtypes.includes('Aura') ? { aura: e.obj } : false)), function* (c) {
        const id = c.event.aura as ObjId;
        if (c.g.state.objects[id]?.zone === 'graveyard') yield* returnToHand(c.g, [id]);
      }, { oncePerTurn: true, text: 'Sempre que uma Aura que você controla é colocada em um cemitério vinda do campo de batalha, devolva-a para a mão do dono. Esta habilidade só é desencadeada uma vez por turno.' }),
    ],
  }],
  rulings: {},
});
