// Glimmervoid
// At the beginning of the end step, if you control no artifacts, sacrifice this land.
// {T}: Add one mana of any color.
import { controlledBy, defineCard, isType, mana, on, sacrifice, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Glimmervoid',
  faces: [{
    abilities: [
      // CR 603.4: interveniente
      triggered(on.endStep('each'), function* (c) { yield* sacrifice(c.g, [c.source]); }, {
        condition: (c) => controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')).length === 0,
        text: 'No início da etapa final, se você não controlar artefatos, sacrifique este terreno.',
      }),
      mana('any'),
    ],
  }],
  rulings: {},
});
