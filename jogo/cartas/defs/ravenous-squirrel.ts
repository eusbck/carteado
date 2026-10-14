// Ravenous Squirrel
// Whenever you sacrifice an artifact or creature, put a +1/+1 counter on this creature.
// {1}{B}{G}, Sacrifice an artifact or creature: You gain 1 life and draw a card.
import { activated, addCounters, defineCard, draw, gainLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Ravenous Squirrel',
  faces: [{
    abilities: [
      // pela última informação do sacrificado (CR 603.10a)
      triggered(on.custom((e, c) => {
        if (e.type !== 'sacrifice' || e.player !== c.you) return false;
        const tipos = c.g.state.lki[e.old]?.chars.types ?? [];
        return tipos.includes('Artifact') || tipos.includes('Creature');
      }), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que você sacrifica um artefato ou uma criatura, coloque um marcador +1/+1 nesta criatura.' }),
      activated('{1}{B}{G}, Sacrifice an artifact or creature', function* (c) {
        gainLife(c.g, c.you, 1, c.source);
        yield* draw(c.g, c.you, 1);
      }, { text: '{1}{B}{G}, Sacrifique um artefato ou uma criatura: Você ganha 1 de vida e compra uma carta.' }),
    ],
  }],
  rulings: {},
});
