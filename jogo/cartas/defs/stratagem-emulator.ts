// Stratagem Emulator
// When this creature dies, create X 1/1 colorless Borg artifact creature tokens, where X is its power.
import { defineCard, lkiChars, on, triggered } from '../../motor/api.ts';
import { criaBorg } from '../borg.ts';

export default defineCard({
  name: 'Stratagem Emulator',
  faces: [{
    abilities: [
      // a força é a da última vez que esteve no campo (CR 603.10a)
      triggered(on.selfDies(), function* (c) {
        yield* criaBorg(c, Math.max(0, lkiChars(c.g, c.source)?.power ?? 0));
      }, { text: 'Quando esta criatura morre, crie X fichas de criatura artefato Borg 1/1 incolor, sendo X a força dela.' }),
    ],
  }],
  rulings: {},
});
