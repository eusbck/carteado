// Beastmaster Ascension
// Whenever a creature you control attacks, you may put a quest counter on this enchantment.
// As long as this enchantment has seven or more quest counters on it, creatures you control get +5/+5.
import { addCounters, and, anthem, controllerOf, defineCard, is, isCreature, on, triggered, yesNo } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

export default defineCard({
  name: 'Beastmaster Ascension',
  faces: [{
    abilities: [
      // ruling 1: um gatilho para cada criatura sua que ataca
      triggered(on.custom((e, c) => (e.type === 'attackers'
        ? e.attackers.filter((a) => !!c.g.state.objects[a.obj] && isCreature(c.g, a.obj) && controllerOf(c.g, a.obj) === c.you).map((a) => ({ atacante: a.obj }))
        : false)), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        if (yield* yesNo(c.g, c.you, 'Beastmaster Ascension: colocar um marcador de missão?')) addCounters(c.g, { kind: 'obj', id: c.source }, 'quest', 1, c.you);
      }, { text: 'Sempre que uma criatura que você controla ataca, você pode colocar um marcador de missão neste encantamento.' }),
      {
        ...anthem(and(is.creature, is.yours), () => [{ k: 'pt', p: 5, t: 5 }], 'Enquanto este encantamento tiver sete ou mais marcadores de missão, as criaturas que você controla recebem +5/+5.'),
        condition: (c: SCtx) => (c.g.state.objects[c.source]?.counters.quest ?? 0) >= 7,
      },
    ],
  }],
  rulings: {
    1: 'teste: um marcador de missão para cada criatura sua que ataca; com sete, as suas criaturas recebem +5/+5',
  },
});
