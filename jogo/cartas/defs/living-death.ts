// Living Death
// Each player exiles all creature cards from their graveyard, then sacrifices all creatures they control, then puts
// all cards they exiled this way onto the battlefield.
import { allCreatures, defineCard, exile, isCreature, putOntoBattlefield, sacrifice } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Living Death',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        // ruling 1: cada passo acontece para todos os jogadores ao mesmo tempo
        const doCemiterio = c.g.playersInGame().flatMap((p) => s.zones.graveyard[p].filter((id) => isCreature(c.g, id)));
        const exiladas = (yield* exile(c.g, doCemiterio)).filter((id): id is ObjId => id !== null && c.g.state.objects[id]?.zone === 'exile');
        yield* sacrifice(c.g, allCreatures(c.g));
        // ruling 2: só voltam as cartas exiladas pela primeira instrução; cada jogador as põe sob seu controle (dono)
        const voltam = exiladas.filter((id) => c.g.state.objects[id]?.zone === 'exile');
        if (voltam.length) yield* putOntoBattlefield(c.g, voltam.map((id) => ({ id, controller: c.g.state.objects[id].owner })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'teste: exila, sacrifica e devolve ao mesmo tempo para todos os jogadores',
    2: 'teste: criatura sacrificada que é exilada em vez de ir ao cemitério não volta',
  },
});
