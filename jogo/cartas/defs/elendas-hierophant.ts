// Elenda's Hierophant
// Flying
// Whenever you gain life, put a +1/+1 counter on this creature.
// When this creature dies, create X 1/1 white Vampire creature tokens with lifelink, where X is its power.
import { addCounters, createTokens, defineCard, keyword, lkiChars, on, triggered } from '../../motor/api.ts';
import { GANHO_DE_VIDA } from '../miku.ts';

export default defineCard({
  name: "Elenda's Hierophant",
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.youGainLife(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que você ganha vida, coloque um marcador +1/+1 nesta criatura.' }),
      triggered(on.selfDies(), function* (c) {
        // a força que ela tinha quando estava no campo pela última vez (CR 608.2h)
        const x = Math.max(0, lkiChars(c.g, c.source)?.power ?? 0);
        if (x > 0) yield* createTokens(c.g, c.you, 'Vampire 1/1 branca', x);
      }, { text: 'Quando esta criatura morre, crie X fichas de criatura Vampire 1/1 brancas com vínculo com a vida, onde X é a força dela.' }),
    ],
  }],
  rulings: {
    1: GANHO_DE_VIDA.umPorEvento,
    2: GANHO_DE_VIDA.danoLetal,
    3: GANHO_DE_VIDA.vinculo,
    4: GANHO_DE_VIDA.paraCada,
    5: GANHO_DE_VIDA.duasCabecas,
  },
});