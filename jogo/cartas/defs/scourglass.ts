// Scourglass
// {T}, Sacrifice this artifact: Destroy all permanents except for artifacts and lands. Activate only during your upkeep.
import { activated, chars, defineCard, destroy } from '../../motor/api.ts';

export default defineCard({
  name: 'Scourglass',
  faces: [{
    abilities: [
      activated('{T}, Sacrifice this artifact', function* (c) {
        const s = c.g.state;
        // ruling 2: o que é artefato ou terreno fica, tenha os outros tipos que tiver
        const ids = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && !chars(c.g, id).types.some((tp) => tp === 'Artifact' || tp === 'Land'));
        if (ids.length) yield* destroy(c.g, ids);
      }, {
        condition: (c) => c.g.state.turn.active === c.you && c.g.state.turn.step === 'upkeep',
        text: '{T}, Sacrifique este artefato: Destrua todas as permanentes, exceto artefatos e terrenos. Ative somente durante a sua manutenção.',
      }),
    ],
  }],
  rulings: {
    1: 'não se aplica: Scourglass é um artefato colorido; a cor não muda nada nesta carta',
    2: 'teste: na sua manutenção, destrói tudo menos artefatos e terrenos, inclusive criaturas artefato',
  },
});