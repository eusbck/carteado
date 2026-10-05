// Spirit Mantle
// Enchant creature
// Enchanted creature gets +1/+1 and has protection from creatures.
import { attachedGets, defineCard, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Spirit Mantle',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [attachedGets(() => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'protection', param: 'creatures' }], 'A criatura encantada recebe +1/+1 e tem proteção contra criaturas.')],
  }],
});
