// Sanctum Seeker
// Whenever a Vampire you control attacks, each opponent loses 1 life and you gain 1 life.
import { controllerOf, defineCard, gainLife, isSubtype, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Sanctum Seeker',
  faces: [{
    abilities: [
      // um gatilho para cada Vampire seu que ataca
      triggered(on.custom((e, c) => (e.type === 'attackers'
        ? e.attackers.filter((a) => !!c.g.state.objects[a.obj] && controllerOf(c.g, a.obj) === c.you && isSubtype(c.g, a.obj, 'Vampire')).map((a) => ({ atacante: a.obj }))
        : false)), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que um Vampire que você controla ataca, cada oponente perde 1 de vida e você ganha 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'não se aplica: Gigante de Duas Cabeças fora do escopo',
  },
});
