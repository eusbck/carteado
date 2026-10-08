// The Scorpion God
// Whenever a creature with a -1/-1 counter on it dies, draw a card.
// {1}{B}{R}: Put a -1/-1 counter on another target creature.
// When The Scorpion God dies, return it to its owner's hand at the beginning of the next end step.
import { activated, addCounters, defineAbility, defineCard, delayed, draw, is, moveObjects, nextEndStepTrigger, on, t, tgt, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const VOLTA = defineAbility('The Scorpion God:volta', nextEndStepTrigger(function* (c) {
  const carta = c.data.carta as ObjId;
  if (c.g.state.objects[carta]?.zone === 'graveyard') yield* moveObjects(c.g, [{ id: carta, to: 'hand' }], 'effect');
}, 'No início da próxima etapa final, devolva The Scorpion God à mão do dono.'));

export default defineCard({
  name: 'The Scorpion God',
  faces: [{
    abilities: [
      // rulings 1-2: uma carta por criatura, olhando para trás (vale para ela mesma e para quem morre junto)
      triggered(on.dies((_c, _l, o) => (o.counters['-1/-1'] ?? 0) > 0), function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Sempre que uma criatura com marcador -1/-1 morre, compre uma carta.' }),
      activated('{1}{B}{R}', function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '-1/-1', 1, c.you);
      }, { targets: [t.creature(is.other, 'outra criatura alvo')], text: '{1}{B}{R}: Coloque um marcador -1/-1 em outra criatura alvo.' }),
      triggered(on.selfDies(), function* (c) {
        const carta = c.g.state.lki[c.source]?.newId ?? null;
        if (carta !== null) delayed(c, VOLTA.id!, { data: { carta } });
      }, { text: 'Quando The Scorpion God morre, devolva-o à mão do dono no início da próxima etapa final.' }),
    ],
  }],
  rulings: {
    1: 'teste: morrendo com marcador, compra pela própria morte',
    2: 'teste: uma carta por criatura, mesmo com vários marcadores',
  },
});
