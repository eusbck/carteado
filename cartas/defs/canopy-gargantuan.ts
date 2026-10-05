// Canopy Gargantuan
// Flying, ward {2}
// At the beginning of your upkeep, put a number of +1/+1 counters on each other creature you control equal to that
// creature's toughness.
import { addCounters, creaturesOf, defineCard, keyword, on, toughness, triggered, ward } from '../../motor/api.ts';

export default defineCard({
  name: 'Canopy Gargantuan',
  faces: [{
    abilities: [
      keyword('flying'),
      ...ward('{2}'),
      triggered(on.upkeep('you'), function* (c) {
        // cada uma recebe conforme a própria resistência antes dos marcadores (tudo de uma vez)
        const quanto = creaturesOf(c.g, c.you).filter((id) => id !== c.source).map((id) => [id, toughness(c.g, id)] as const);
        for (const [id, n] of quanto) if (n > 0) addCounters(c.g, { kind: 'obj', id }, '+1/+1', n, c.you);
      }, { text: 'No início da sua manutenção, coloque em cada outra criatura sua uma quantidade de marcadores +1/+1 igual à resistência dela.' }),
    ],
  }],
  rulings: {},
});
