// Conquest Mission
// Whenever a nontoken artifact you control enters, put a quest counter on this enchantment. Create a 1/1 colorless
// Borg artifact creature token. If this enchantment has six or more quest counters on it, create two of those tokens
// instead.
import { addCounters, and, defineCard, is, on, triggered } from '../../motor/api.ts';
import { criaBorg } from '../borg.ts';

export default defineCard({
  name: 'Conquest Mission',
  faces: [{
    abilities: [
      triggered(on.enters(and(is.artifact, is.nontoken, is.yours)), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'quest', 1, c.you);
        // se o encantamento já saiu, usa a última informação
        const o = c.g.state.objects[c.source] ?? c.g.state.lki[c.source]?.obj;
        yield* criaBorg(c, (o?.counters.quest ?? 0) >= 6 ? 2 : 1);
      }, { text: 'Sempre que um artefato que não é ficha que você controla entra, coloque um marcador de missão neste encantamento. Crie uma ficha de criatura artefato Borg 1/1 incolor. Se este encantamento tiver seis ou mais marcadores de missão, crie duas dessas fichas em vez disso.' }),
    ],
  }],
  rulings: {},
});
