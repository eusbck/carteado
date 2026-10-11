// Hour of Reckoning
// Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one
// mana of that creature's color.)
// Destroy all nontoken creatures.
import { allCreatures, defineCard, destroy } from '../../motor/api.ts';

export default defineCard({
  name: 'Hour of Reckoning',
  faces: [{
    convoke: true,
    spell: {
      *effect(c) {
        const ids = allCreatures(c.g).filter((id) => !c.g.state.objects[id].isToken);
        if (ids.length) yield* destroy(c.g, ids);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.51a — qualquer criatura desvirada sua pode ser virada para convocar, mesmo com enjoo de invocação (motor/costs.ts)',
    2: 'regra geral: CR 506.4b — virar a atacante ou bloqueadora para convocar não a tira do combate (motor/costs.ts)',
    3: 'regra geral: CR 702.51b — convocar entra depois do custo total e não muda o valor de mana (motor/stack.ts)',
    4: 'regra geral: CR 601.2g — a criatura virada por uma habilidade de mana antes do pagamento não pode ser virada de novo para convocar (motor/costs.ts)',
    5: 'regra geral: CR 702.51b — convocar não é custo alternativo e soma com um (motor/stack.ts)',
    6: 'regra geral: CR 702.51a — a criatura multicolorida paga {1} ou uma mana de uma das cores dela (motor/costs.ts)',
  },
});