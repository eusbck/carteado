// Poison-Tip Archer
// Reach (This creature can block creatures with flying.)
// Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)
// Whenever another creature dies, each opponent loses 1 life.
import { defineCard, keywords, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Poison-Tip Archer',
  faces: [{
    abilities: [
      ...keywords('reach', 'deathtouch'),
      // ruling 1: morrendo junto com outras, olha para trás e dispara por elas (CR 603.10a)
      triggered(on.dies((c, _l, old) => old.id !== c.source), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
      }, { text: 'Sempre que outra criatura morre, cada oponente perde 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'teste: morre junto com outra criatura: cada oponente perde 1 de vida por ela',
    2: 'não se aplica: Gigante de Duas Cabeças fora do escopo',
  },
});
