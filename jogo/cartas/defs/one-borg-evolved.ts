// One, Borg Evolved
// Artifact creatures you control have flying, double strike, vigilance, menace, lifelink, and ward {2}.
import { and, anthem, defineCard, is, wardGranted } from '../../motor/api.ts';

export default defineCard({
  name: 'One, Borg Evolved',
  faces: [{
    abilities: [anthem(and(is.creature, is.artifact, is.yours), () => [
      ...['flying', 'double strike', 'vigilance', 'menace', 'lifelink'].map((kw) => ({ k: 'addKeyword' as const, kw })),
      { k: 'addKeyword', kw: 'ward', param: '{2}' }, { k: 'addAbility', id: wardGranted('{2}') },
    ], 'As criaturas-artefato que você controla têm voar, golpe duplo, vigilância, ameaça, vínculo com a vida e resguardo {2}.')],
  }],
  rulings: {},
});
