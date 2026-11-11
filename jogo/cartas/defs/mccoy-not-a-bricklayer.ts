// McCoy, Not a Bricklayer
// Whenever McCoy or another Doctor you control enters, put a +1/+1 counter on each creature you control.
// Creatures you control with counters on them have lifelink.
import { addCounters, anthem, chars, controllerOf, creaturesOf, defineCard, isCreature, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'McCoy, Not a Bricklayer',
  faces: [{
    abilities: [
      triggered(on.enters((c, id) => controllerOf(c.g, id) === c.you && (id === c.source || (isCreature(c.g, id) && chars(c.g, id).subtypes.includes('Doctor')))), function* (c) {
        for (const id of creaturesOf(c.g, c.you)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que McCoy ou outro Doctor que você controla entra, coloque um marcador +1/+1 em cada criatura que você controla.' }),
      anthem((c, id) => isCreature(c.g, id) && controllerOf(c.g, id) === c.you && Object.values(c.g.state.objects[id]?.counters ?? {}).some((n) => n > 0),
        () => [{ k: 'addKeyword', kw: 'lifelink' }], 'As criaturas que você controla com marcadores têm vínculo com a vida.'),
    ],
  }],
  rulings: {},
});
