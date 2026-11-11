// Bronze Guardian
// Double strike
// Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless
// that player pays {2}.)
// Other artifacts you control have ward {2}.
// Bronze Guardian's power is equal to the number of artifacts you control.
import { and, anthem, controlledBy, defineCard, is, isType, keyword, selfGets, ward, wardGranted } from '../../motor/api.ts';

export default defineCard({
  name: 'Bronze Guardian',
  faces: [{
    abilities: [
      keyword('double strike'),
      ...ward('{2}'),
      anthem(and(is.artifact, is.yours, is.other), () => [{ k: 'addKeyword', kw: 'ward', param: '{2}' }, { k: 'addAbility', id: wardGranted('{2}') }],
        'Os outros artefatos que você controla têm resguardo {2}.'),
      // CR 604.3: CDA, vale em todas as zonas (ruling 1); a resistência impressa é 5
      selfGets((c) => [{ k: 'setPT', p: controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')).length, t: 5 }],
        'A força de Bronze Guardian é igual ao número de artefatos que você controla.', { cda: true }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 604.3 — habilidade que define característica vale em todas as zonas (motor/chars.ts cda)',
    2: 'regra geral: CR 702.21a — cada resguardo dispara; sem pagar todos, a mágica é anulada (motor/mecanicas.ts)',
    3: 'regra geral: CR 702.21a — o resguardo disparado resolve mesmo se o artefato perder resguardo (motor/mecanicas.ts)',
  },
});
