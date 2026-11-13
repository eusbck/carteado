// Intuition
// Search your library for three cards and reveal them. Target opponent chooses one. Put that card into your hand and
// the rest into your graveyard. Then shuffle.
import { chooseItems, defineCard, moveObjects, nameOf, objItem, searchLibrary, shuffleLibrary, t, tgtPlayer } from '../../motor/api.ts';
import type { ZoneName } from '../../motor/types.ts';

export default defineCard({
  name: 'Intuition',
  faces: [{
    spell: {
      // ruling 1: oponente alvo, escolhido ao conjurar; sem oponente que possa ser alvo, não dá para conjurar
      targets: [t.opponent()],
      *effect(c) {
        const op = tgtPlayer(c);
        // "três cartas" sem característica: é preciso achar três se houver (CR 701.23d)
        const n = Math.min(3, c.g.state.zones.library[c.you].length);
        const achadas = yield* searchLibrary(c.g, c.you, c.you, { max: 3, min: n, prompt: 'Procure três cartas' });
        if (achadas.length) {
          c.g.log(`${c.g.state.players[c.you].name} revela ${achadas.map((id) => nameOf(c.g, id)).join(', ')}.`, { rule: '701.20' });
          let paraMao = achadas[0];
          if (op !== null && achadas.length > 1) {
            const [r] = yield* chooseItems(c.g, op, `Intuition: escolha a carta que vai para a mão de ${c.g.state.players[c.you].name} (as outras vão para o cemitério)`, achadas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
            paraMao = Number(r);
          }
          yield* moveObjects(c.g, achadas.map((id) => ({ id, to: (id === paraMao ? 'hand' : 'graveyard') as ZoneName })), 'search');
        }
        shuffleLibrary(c.g, c.you);
      },
    },
  }],
  rulings: { 1: 'teste: o oponente alvo escolhe a carta que vai para a mão; as outras vão para o cemitério' },
});
