// Unstable Molecule Suit
// Equipped creature gets +2/+2 and has indestructible.
// Equip commander {2}
// Equip {4}
import { activated, and, attach, attachedGets, defineCard, equip, is, t, tgt } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';

const comandante = (c: SCtx, id: ObjId): boolean => {
  const o = c.g.state.objects[id];
  return !!o && o.card !== null && !!c.g.state.cards[o.card]?.isCommander;
};

export default defineCard({
  name: 'Unstable Molecule Suit',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'indestructible' }], 'A criatura equipada recebe +2/+2 e tem indestrutível.'),
      // CR 702.6c: equipar com restrição de alvo é uma habilidade de equipar como as outras
      activated('{2}', function* (c) {
        const alvo = tgt(c);
        if (alvo !== null && c.g.state.objects[c.source]) attach(c.g, c.source, alvo);
      }, { kw: 'equip', param: '{2}', timing: 'sorcery', targets: [t.creature(and(is.yours, comandante), 'comandante alvo que você controla')], text: 'Equipar comandante {2}' }),
      equip('{4}'),
    ],
  }],
  rulings: {},
});
