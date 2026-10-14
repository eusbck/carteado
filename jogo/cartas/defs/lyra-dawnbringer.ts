// Lyra Dawnbringer
// Flying
// First strike (This creature deals combat damage before creatures without first strike.)
// Lifelink (Damage dealt by this creature also causes you to gain that much life.)
// Other Angels you control get +1/+1 and have lifelink.
import { and, anthem, defineCard, is, keywords } from '../../motor/api.ts';

export default defineCard({
  name: 'Lyra Dawnbringer',
  faces: [{
    abilities: [
      ...keywords('flying', 'first strike', 'lifelink'),
      anthem(and(is.creature, is.subtype('Angel'), is.yours, is.other), () => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'lifelink' }], 'Os outros Angels que você controla recebem +1/+1 e têm vínculo com a vida.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.15f — várias instâncias de vínculo com a vida são redundantes',
    2: 'regra geral: CR 704.5g — o dano fica marcado até a limpeza; sem o bônus, pode virar letal (motor/sba.ts)',
  },
});
