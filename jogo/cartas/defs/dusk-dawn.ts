// Dusk // Dawn (dividida com aftermath)
// Dusk {2}{W}{W} — Sorcery
// Destroy all creatures with power 3 or greater.
// Dawn {3}{W}{W} — Sorcery
// Aftermath (Cast this spell only from your graveyard. Then exile it.)
// Return all creature cards with power 2 or less from your graveyard to your hand.
import { allCreatures, defineCard, destroy, isCreature, moveObjects, power, type ZoneName } from '../../motor/api.ts';

export default defineCard({
  name: 'Dusk // Dawn',
  faces: [
    {
      spell: {
        *effect(c) {
          const alvos = allCreatures(c.g).filter((id) => power(c.g, id) >= 3);
          if (alvos.length) yield* destroy(c.g, alvos);
        },
      },
    },
    {
      // aftermath (CR 702.127a): conjurar só do cemitério e exilar ao sair da pilha fica no motor (motor/formatos.ts)
      spell: {
        *effect(c) {
          const ids = c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id) && power(c.g, id) <= 2);
          if (ids.length) yield* moveObjects(c.g, ids.map((id) => ({ id, to: 'hand' as ZoneName })), 'effect');
        },
      },
    },
  ],
  rulings: {
    1: 'regra geral: CR 601.2a — a carta vai para a pilha ao começar a conjurar (motor/stack.ts)',
    2: 'teste: CR 709.3b — na pilha só existe a metade conjurada',
    3: 'teste: CR 709.2 — a carta dividida é uma carta só e conta uma vez',
    4: 'não se aplica: nenhuma carta dos decks manda escolher um nome',
    5: 'teste: CR 709.4 — fora da pilha tem as duas metades: feitiço de valor de mana 9',
    6: 'não se aplica: o desenho da moldura não tem efeito no jogo',
    7: 'teste: CR 702.127a — Dawn não se conjura da mão nem com permissão de outra zona',
    8: 'teste: permissão de conjurar do cemitério oferece as duas metades; Dawn assim também é exilada',
    9: 'teste: CR 702.127a — Dawn anulada também vai para o exílio',
    10: 'teste: depois de Dusk resolver no seu turno, Dawn já pode ser conjurada do cemitério',
  },
});
