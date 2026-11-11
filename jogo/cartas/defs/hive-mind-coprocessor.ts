// Hive Mind Coprocessor
// Artifact creatures you control have "Whenever this creature deals combat damage to a player, you may pay 1 life. If
// you do, draw a card."
import { defineCard, draw, payParts, yesNo } from '../../motor/api.ts';
import { artefatosTem, concedidaDanoDeCombate } from '../borg.ts';

const HAB = concedidaDanoDeCombate('Hive Mind Coprocessor:dano', function* (c) {
  // CR 119.4: só pode pagar vida quem tem pelo menos essa quantidade
  if (c.g.state.players[c.you].life < 1) return;
  if (!(yield* yesNo(c.g, c.you, 'Pagar 1 de vida para comprar uma carta?'))) return;
  const pago = yield* payParts(c.g, c.you, [{ k: 'life', n: 1 }], c.source, 0);
  if (pago !== false) yield* draw(c.g, c.you, 1);
}, 'Sempre que esta criatura causa dano de combate a um jogador, você pode pagar 1 de vida. Se fizer isso, compre uma carta.');

export default defineCard({
  name: 'Hive Mind Coprocessor',
  faces: [{ abilities: [artefatosTem(HAB, 'As criaturas artefato que você controla têm "Sempre que esta criatura causa dano de combate a um jogador, você pode pagar 1 de vida. Se fizer isso, compre uma carta."')] }],
  rulings: {},
});
