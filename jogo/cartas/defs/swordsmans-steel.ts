// Swordsman's Steel
// When this Equipment enters, draw a card for each Equipment you control.
// Equipped creature gets +2/+2 for each Equipment you control.
// Equip {3}
import { attachedGets, defineCard, draw, equip, etb } from '../../motor/api.ts';
import { equipamentosDe } from '../jin.ts';

export default defineCard({
  name: "Swordsman's Steel",
  faces: [{
    abilities: [
      // a quantidade é contada na resolução (CR 608.2h)
      etb(function* (c) {
        const n = equipamentosDe(c.g, c.you).length;
        if (n > 0) yield* draw(c.g, c.you, n);
      }, { text: 'Quando este Equipamento entra, compre uma carta para cada Equipamento que você controla.' }),
      attachedGets((c) => { const n = equipamentosDe(c.g, c.you).length; return [{ k: 'pt', p: 2 * n, t: 2 * n }]; }, 'A criatura equipada recebe +2/+2 para cada Equipamento que você controla.'),
      equip('{3}'),
    ],
  }],
  rulings: {},
});
