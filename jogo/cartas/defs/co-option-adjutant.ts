// Co-Option Adjutant
// Artifact creatures you control have "Whenever this creature deals combat damage to a player, draw a card."
import { defineCard, draw } from '../../motor/api.ts';
import { artefatosTem, concedidaDanoDeCombate } from '../borg.ts';

const HAB = concedidaDanoDeCombate('Co-Option Adjutant:dano', function* (c) {
  yield* draw(c.g, c.you, 1);
}, 'Sempre que esta criatura causa dano de combate a um jogador, compre uma carta.');

export default defineCard({
  name: 'Co-Option Adjutant',
  faces: [{ abilities: [artefatosTem(HAB, 'As criaturas artefato que você controla têm "Sempre que esta criatura causa dano de combate a um jogador, compre uma carta."')] }],
  rulings: {},
});
