// Ethereal Armor
// Enchant creature
// Enchanted creature gets +1/+1 for each enchantment you control and has first strike.
import { attachedGets, controlledBy, defineCard, isType, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Ethereal Armor',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [attachedGets((c) => {
      // ruling 1: conta a própria e todas as suas, onde quer que estejam anexadas
      const n = controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Enchantment')).length;
      return [{ k: 'pt', p: n, t: n }, { k: 'addKeyword', kw: 'first strike' }];
    }, 'A criatura encantada recebe +1/+1 para cada encantamento que você controla e tem primeiro golpe.')],
  }],
  rulings: { 1: 'teste: conta a própria e Auras suas anexadas a criaturas do oponente' },
});
