// Shallow Grave
// Return the top creature card of your graveyard to the battlefield. That creature gains haste until end of turn. Exile
// it at the beginning of the next end step.
import { chars, defineCard, delayed, putOntoBattlefield, untilEndOfTurn } from '../../motor/api.ts';
import { EXILA_NO_FIM } from '../cedh.ts';

export default defineCard({
  name: 'Shallow Grave',
  faces: [{
    spell: {
      *effect(c) {
        const g = c.g;
        // o fim da lista do cemitério é o topo (motor/state.ts)
        const cem = g.state.zones.graveyard[c.you];
        const topo = [...cem].reverse().find((id) => chars(g, id).types.includes('Creature'));
        if (topo === undefined) return;
        const [novo] = yield* putOntoBattlefield(g, [{ id: topo, controller: c.you }], 'effect');
        if (novo === undefined) return;
        untilEndOfTurn(c, [novo], [{ k: 'addKeyword', kw: 'haste' }]);
        // ruling 1: só exila se ainda estiver no campo no início da etapa final
        delayed(c, EXILA_NO_FIM, { data: { obj: novo } });
      },
    },
  }],
  rulings: { 1: 'teste: devolve a criatura de cima do cemitério e a exila no início da próxima etapa final' },
});
