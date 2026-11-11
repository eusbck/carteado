// Kodama of the West Tree
// Reach
// Modified creatures you control have trample. (Equipment, Auras you control, and counters are modifications.)
// Whenever a modified creature you control deals combat damage to a player, search your library for a basic land
// card, put it onto the battlefield tapped, then shuffle.
import { anthem, controllerOf, defineCard, fetchBasicToBattlefield, isCreature, keyword, on, triggered } from '../../motor/api.ts';
import { modificada } from '../vingadores.ts';

export default defineCard({
  name: 'Kodama of the West Tree',
  faces: [{
    abilities: [
      keyword('reach'),
      // rulings 1-3: CR 700.9 (cartas/vingadores.ts modificada)
      anthem((c, id) => controllerOf(c.g, id) === c.you && isCreature(c.g, id) && modificada(c.g, id), () => [{ k: 'addKeyword', kw: 'trample' }],
        'As criaturas modificadas que você controla têm atropelar.'),
      triggered(on.custom((e, c) => e.type === 'damage' && e.combat && e.target.kind === 'player' && !!c.g.state.objects[e.source]
        && controllerOf(c.g, e.source) === c.you && isCreature(c.g, e.source) && modificada(c.g, e.source)), function* (c) {
        yield* fetchBasicToBattlefield(c, 1, { tapped: true, prompt: 'Procure uma carta de terreno básico' });
      }, { text: 'Sempre que uma criatura modificada que você controla causa dano de combate a um jogador, procure no seu grimório uma carta de terreno básico, coloque-a no campo virada e depois embaralhe.' }),
    ],
  }],
  rulings: {
    1: 'teste: a Aura de um oponente não modifica a sua criatura; marcador e Equipamento de qualquer um, sim',
    2: 'teste: a Aura de um oponente não modifica a sua criatura; marcador e Equipamento de qualquer um, sim',
    3: 'teste: a Aura de um oponente não modifica a sua criatura; marcador e Equipamento de qualquer um, sim',
  },
});
