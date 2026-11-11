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
      // ruling 3: o resguardo já disparado resolve mesmo que o artefato perca o resguardo (CR 113.7a)
      anthem(and(is.yours, is.artifact, is.other), () => [{ k: 'addKeyword', kw: 'ward', param: '{2}' }, { k: 'addAbility', id: wardGranted('{2}') }], 'Os outros artefatos que você controla têm resguardo {2}.'),
      // ruling 1: CDA (CR 604.3), vale em todas as zonas
      selfGets((c) => [{ k: 'setPT', p: controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')).length, t: 5 }], 'A força de Bronze Guardian é igual ao número de artefatos que você controla.', { cda: true }),
    ],
  }],
  rulings: {
    1: 'teste: CR 604.3: a força conta os artefatos que você controla, também com a carta fora do campo',
    2: 'regra geral: CR 702.21a — cada permanente com resguardo mirado pela mesma mágica dispara o seu resguardo; um só não pago anula a mágica (motor/mecanicas.ts)',
    3: 'teste: CR 113.7a: o resguardo disparado anula a mágica mesmo que Bronze Guardian saia do campo antes',
  },
});
