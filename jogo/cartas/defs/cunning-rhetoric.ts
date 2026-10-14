// Cunning Rhetoric
// Whenever an opponent attacks you and/or one or more planeswalkers you control, exile the top card of that player's
// library. You may play that card for as long as it remains exiled, and you may spend mana as though it were mana of any
// color to cast it.
import { allowPlay, controllerOf, defineCard, exile, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { ROUBO } from '../roubo.ts';

export default defineCard({
  name: 'Cunning Rhetoric',
  faces: [{
    abilities: [
      // uma vez por declaração de ataque (CR 508.3d), contando você e os seus planeswalkers juntos
      triggered(on.custom((e, c) => e.type === 'attackers' && c.g.isOpponent(c.you, e.player)
        && e.attackers.some((a) => (a.target.kind === 'player' ? a.target.id === c.you : !!c.g.state.objects[a.target.id] && controllerOf(c.g, a.target.id) === c.you))
        ? { atacante: e.player } : false), function* (c) {
        const p = c.event.atacante as PlayerId;
        const topo = c.g.state.zones.library[p]?.[0];
        if (topo === undefined || c.g.state.players[p].left) return;
        const [ex] = yield* exile(c.g, [topo]);
        if (ex === null || ex === undefined || c.g.state.objects[ex]?.zone !== 'exile') return;
        // "como se fosse mana de qualquer cor": o motor usa a permissão de qualquer tipo (motor/mana.ts anyType)
        allowPlay(c.g, c.you, c.source, [ex], { kind: 'permanent' }, { anyType: true });
      }, {
        text: 'Sempre que um oponente ataca você e/ou um ou mais planeswalkers que você controla, exile a carta do topo do grimório desse jogador. Você pode jogar essa carta enquanto ela continuar exilada, e pode gastar mana como se fosse mana de qualquer cor para conjurá-la.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: um terreno exilado assim se joga só com a jogada de terreno do turno disponível',
    2: ROUBO.tempo,
    3: ROUBO.sai,
  },
});
