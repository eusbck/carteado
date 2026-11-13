// Supplementation Node
// Artifact creatures you control have "Whenever this creature deals combat damage to a player, put a +1/+1 counter on
// it."
import { addCounters, defineCard } from '../../motor/api.ts';
import { artefatosTem, concedidaDanoDeCombate } from '../borg.ts';

const HAB = concedidaDanoDeCombate('Supplementation Node:dano', function* (c) {
  if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
}, 'Sempre que esta criatura causa dano de combate a um jogador, coloque um marcador +1/+1 nela.');

export default defineCard({
  name: 'Supplementation Node',
  faces: [{ abilities: [artefatosTem(HAB, 'As criaturas artefato que você controla têm "Sempre que esta criatura causa dano de combate a um jogador, coloque um marcador +1/+1 nela."')] }],
  rulings: {},
});
