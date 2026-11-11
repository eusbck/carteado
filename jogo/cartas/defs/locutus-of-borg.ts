// Locutus of Borg
// Lifelink
// Artifact creatures you control have "Whenever this creature deals combat damage to a player, create a 1/1 colorless
// Borg artifact creature token."
import { defineCard, keyword } from '../../motor/api.ts';
import { artefatosTem, concedidaDanoDeCombate, criaBorg } from '../borg.ts';

const HAB = concedidaDanoDeCombate('Locutus of Borg:dano', function* (c) {
  yield* criaBorg(c, 1);
}, 'Sempre que esta criatura causa dano de combate a um jogador, crie uma ficha de criatura artefato Borg 1/1 incolor.');

export default defineCard({
  name: 'Locutus of Borg',
  faces: [{
    abilities: [
      keyword('lifelink'),
      artefatosTem(HAB, 'As criaturas artefato que você controla têm "Sempre que esta criatura causa dano de combate a um jogador, crie uma ficha de criatura artefato Borg 1/1 incolor."'),
    ],
  }],
  rulings: {},
});
