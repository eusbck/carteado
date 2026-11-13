// Cold-Blooded Crew
// When this creature enters, put two +1/+1 counters on target creature.
// This creature can't be blocked by creatures with power 2 or less.
// Basic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into
// your hand, then shuffle.)
import { addCounters, basicLandcycling, defineCard, etb, power, staticAbility, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Cold-Blooded Crew',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 2, c.you);
      }, { targets: [t.creature(undefined, 'criatura alvo')], text: 'Quando esta criatura entra, coloque dois marcadores +1/+1 na criatura alvo.' }),
      // restrição de bloqueio (CR 509.1b): só na declaração
      staticAbility({
        rules: { canBeBlockedBy: (c, atacante, bloqueador) => atacante !== c.source || power(c.g, bloqueador) >= 3 },
        text: 'Esta criatura não pode ser bloqueada por criaturas com força 2 ou menos.',
      }),
      basicLandcycling('{2}'),
    ],
  }],
  rulings: {},
});
