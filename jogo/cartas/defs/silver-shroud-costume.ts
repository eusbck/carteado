// Silver Shroud Costume
// Flash
// When this Equipment enters, attach it to target creature you control. That creature gains shroud until end of turn.
// (It can't be the target of spells or abilities.)
// Equipped creature can't be blocked.
// Equip {3}
import { attach, attachedGets, defineCard, equip, etb, is, keyword, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Silver Shroud Costume',
  faces: [{
    abilities: [
      keyword('flash'),
      etb(function* (c) {
        const id = tgt(c);
        if (id === null) return;
        if (c.g.state.objects[c.source]?.zone === 'battlefield') attach(c.g, c.source, id);
        untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'shroud' }]);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: 'Quando este Equipamento entra, anexe-o à criatura alvo que você controla. Essa criatura ganha manto até o fim do turno.' }),
      attachedGets(() => [{ k: 'addKeyword', kw: 'unblockable' }], 'A criatura equipada não pode ser bloqueada.'),
      equip('{3}'),
    ],
  }],
  rulings: {
    1: 'teste: anexado a uma criatura já bloqueada, ela continua bloqueada (CR 509.1h)',
  },
});
