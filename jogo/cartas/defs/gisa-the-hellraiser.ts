// Gisa, the Hellraiser
// Ward—{2}, Pay 2 life.
// Skeletons and Zombies you control get +1/+1 and have menace.
// Whenever you commit a crime, create two tapped 2/2 blue and black Zombie Rogue creature tokens. This ability
// triggers only once each turn. (Targeting opponents, anything they control, and/or cards in their graveyards is a
// crime.)
import { anthem, and, createTokens, defineCard, is, onYouCommitCrime, or, triggered, ward } from '../../motor/api.ts';

export default defineCard({
  name: 'Gisa, the Hellraiser',
  faces: [{
    abilities: [
      ...ward('{2}, Pay 2 life'),
      anthem(and(is.yours, is.creature, or(is.subtype('Skeleton'), is.subtype('Zombie'))), () => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'menace' }],
        'Os Skeletons e os Zombies que você controla recebem +1/+1 e têm ameaçar.'),
      // CR 700.13 (motor/crime.ts): rulings 1-5
      triggered(onYouCommitCrime(), function* (c) {
        yield* createTokens(c.g, c.you, 'Zombie Rogue', 2, { tapped: true });
      }, { oncePerTurn: true, text: 'Sempre que você comete um crime, crie duas fichas de criatura Zombie Rogue azuis e pretas 2/2 viradas. Esta habilidade só dispara uma vez a cada turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: mirar um oponente, um permanente dele ou uma carta no cemitério dele é crime; mirar algo seu não é',
    2: 'teste: o crime dispara assim que a mágica é conjurada, antes de ela resolver',
    3: 'regra geral: CR 603.3b — os gatilhos do mesmo momento vão para a pilha na ordem que você escolher (motor)',
    4: 'teste: uma mágica com dois alvos criminosos é um crime só, e a habilidade só dispara uma vez por turno',
    5: 'regra geral: só os alvos escolhidos ao conjurar, ativar ou pôr na pilha contam (motor/crime.ts)',
  },
});
