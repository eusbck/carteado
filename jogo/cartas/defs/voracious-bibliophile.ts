// Voracious Bibliophile
// Flying, vigilance
// Whenever you cast a spell with one or more targets, draw that many cards.
import { defineCard, draw, keywords, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Voracious Bibliophile',
  faces: [{
    abilities: [
      ...keywords('flying', 'vigilance'),
      // a quantidade é a de alvos escolhidos ao conjurar (CR 601.2c); ruling 1: a Aura tem o alvo do encantar
      triggered(on.custom((e, c) => {
        if (e.type !== 'cast' || e.player !== c.you) return false;
        const n = c.g.state.objects[e.obj]?.stack?.targets.flat().length ?? 0;
        return n > 0 ? { n } : false;
      }), function* (c) {
        yield* draw(c.g, c.you, c.event.n as number);
      }, { text: 'Sempre que você conjura uma mágica com um ou mais alvos, compre essa quantidade de cartas.' }),
    ],
  }],
  rulings: { 1: 'teste: a mágica de Aura tem um alvo e compra uma carta' },
});
