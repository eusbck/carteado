// Kappa Cannoneer
// Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)
// Ward {4}
// Whenever this creature or another artifact you control enters, put a +1/+1 counter on this creature. It can't be blocked this turn.
import { addCounters, and, defineCard, is, on, triggered, untilEndOfTurn, ward } from '../../motor/api.ts';

export default defineCard({
  name: "Kappa Cannoneer",
  faces: [{
    improvise: true, abilities: [...ward('{4}'), triggered(on.enters(and(is.artifact, is.yours)), function*(c) {
      if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
      addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      untilEndOfTurn(c, [c.source], [{ k: 'rule', id: 'rule:cantBeBlocked' }]);
    }, { text: 'Sempre que entra ou outro artefato seu entra, recebe um marcador +1/+1 e não pode ser bloqueado neste turno.' })]
  }],
  rulings: {
    "1": "CR 702.21a: cada permanente com resguardo alvo cria seu próprio gatilho; regressão do motor confere pagamento e anulação."
  },
});
