// Patron of the Vein
// Flying
// When this creature enters, destroy target creature an opponent controls.
// Whenever a creature an opponent controls dies, exile it and put a +1/+1 counter on each Vampire you control.
import { addCounters, controlledBy, controllerOf, defineCard, destroy, etb, exile, isSubtype, keyword, on, t, tgt, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Patron of the Vein',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, { targets: [t.creature((c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id)), 'criatura alvo que um oponente controla')], text: 'Quando esta criatura entra, destrua a criatura alvo que um oponente controla.' }),
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard') return false;
        const l = c.g.state.lki[e.old];
        return !!l && l.chars.types.includes('Creature') && c.g.isOpponent(c.you, l.chars.controller) ? { carta: e.obj } : false;
      }), function* (c) {
        // ruling 2: os marcadores vêm mesmo que a carta não possa ser exilada (ficha, ou já saiu do cemitério)
        const carta = c.event.carta as ObjId;
        if (c.g.state.objects[carta]?.zone === 'graveyard') yield* exile(c.g, [carta]);
        for (const id of controlledBy(c.g, c.you, (x) => isSubtype(c.g, x, 'Vampire'))) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que uma criatura que um oponente controla morre, exile-a e coloque um marcador +1/+1 em cada Vampire que você controla.' }),
    ],
  }],
  rulings: {
    1: 'teste: ao entrar, destrói a criatura alvo de um oponente; ela é exilada e cada Vampire seu ganha um marcador +1/+1',
    2: 'teste: quando morre uma ficha do oponente, os marcadores vêm mesmo sem carta para exilar',
    3: 'regra geral: CR 603.10a — o gatilho dispara mesmo que Patron of the Vein morra junto; ele não recebe o marcador porque já saiu do campo',
  },
});
