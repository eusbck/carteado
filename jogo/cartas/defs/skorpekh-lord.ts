// Skorpekh Lord
// Menace
// Command Protocols — Other artifact creatures you control get +1/+0 and have menace.
// Unearth {2}{B} ({2}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the
// beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)
import { and, anthem, defineCard, is, keyword, unearth } from '../../motor/api.ts';
import { DESENTERRAR, ehCriaturaArtefato } from '../necrons.ts';

export default defineCard({
  name: 'Skorpekh Lord',
  faces: [{
    abilities: [
      keyword('menace'),
      anthem(and(is.yours, is.other, (c, id) => ehCriaturaArtefato(c.g, id)), () => [{ k: 'pt', p: 1, t: 0 }, { k: 'addKeyword', kw: 'menace' }],
        'Command Protocols — As outras criaturas artefato que você controla recebem +1/+0 e têm ameaçar.'),
      unearth('{2}{B}'),
    ],
  }],
  rulings: {
    1: DESENTERRAR.sumiu,
    2: DESENTERRAR.naoMagica,
    3: DESENTERRAR.sairia,
    4: DESENTERRAR.etapaFinal,
    5: DESENTERRAR.impeto,
  },
});