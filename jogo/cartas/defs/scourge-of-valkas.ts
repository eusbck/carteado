// Scourge of Valkas
// Flying
// Whenever this creature or another Dragon you control enters, it deals X damage to any target, where X is the number
// of Dragons you control.
// {R}: This creature gets +1/+0 until end of turn.
import { activated, and, controlledBy, dealDamage, defineCard, is, isSubtype, keyword, on, or, t, tgtRef, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Scourge of Valkas',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.enters(or((c, id) => id === c.source, and(is.subtype('Dragon'), is.yours))), function* (c) {
        const alvo = tgtRef(c);
        if (!alvo) return;
        // ruling 1: X = Dragons que você controla na resolução; ruling 2: o Dragon que entrou causa o dano mesmo que
        // tenha saído do campo (última informação conhecida)
        const x = controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Dragon')).length;
        if (x > 0) dealDamage(c.g, [{ source: c.event.obj as ObjId, target: alvo, amount: x, combat: false }]);
      }, {
        targets: [t.any()],
        text: 'Sempre que esta criatura ou outro Dragon que você controla entra, ele causa X de dano a qualquer alvo, onde X é o número de Dragons que você controla.',
      }),
      activated('{R}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p: 1, t: 0 }]);
      }, { text: '{R}: Esta criatura recebe +1/+0 até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: X é contado na resolução',
    2: 'teste: o Dragon que entrou causa o dano mesmo fora do campo',
  },
});
