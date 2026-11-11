// One, Borg Evolved
// Artifact creatures you control have flying, double strike, vigilance, menace, lifelink, and ward {2}.
import { defineCard, wardGranted } from '../../motor/api.ts';
import { artefatosRecebem } from '../borg.ts';

export default defineCard({
  name: 'One, Borg Evolved',
  faces: [{
    abilities: [
      artefatosRecebem([
        ...['flying', 'double strike', 'vigilance', 'menace', 'lifelink'].map((kw) => ({ k: 'addKeyword' as const, kw })),
        { k: 'addKeyword', kw: 'ward', param: '{2}' }, { k: 'addAbility', id: wardGranted('{2}') },
      ], 'As criaturas artefato que você controla têm voar, golpe duplo, vigilância, ameaçar, vínculo com a vida e resguardo {2}.'),
    ],
  }],
  rulings: {},
});
