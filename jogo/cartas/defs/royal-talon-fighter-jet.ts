// Royal Talon Fighter Jet
// Flying
// This Vehicle enters with X +1/+1 counters on it.
// Whenever this Vehicle enters or attacks, create a number of 1/1 white Soldier creature tokens equal to the number of
// +1/+1 counters on it.
// Crew 2
import { createTokens, crew, defineCard, entersWithCounters, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Royal Talon Fighter Jet',
  faces: [{
    abilities: [
      keyword('flying'),
      // X é o da mágica; posto no campo sem ser conjurado, X é 0
      entersWithCounters('+1/+1', (_c, ev) => Number(ev.spell?.x ?? 0)),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source))), function* (c) {
        // os marcadores que ele tem na resolução (ou tinha, se já saiu do campo)
        const n = (c.g.state.objects[c.source] ?? c.g.state.lki[c.source]?.obj)?.counters['+1/+1'] ?? 0;
        if (n > 0) yield* createTokens(c.g, c.you, 'Soldier', n);
      }, { text: 'Sempre que este Vehicle entra ou ataca, crie um número de fichas de criatura Soldier 1/1 brancas igual ao número de marcadores +1/+1 nele.' }),
      crew(2),
    ],
  }],
  rulings: {},
});