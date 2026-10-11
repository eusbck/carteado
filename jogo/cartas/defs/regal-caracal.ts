// Regal Caracal
// Other Cats you control get +1/+1 and have lifelink. (Damage dealt by those creatures also causes you to gain that much
// life.)
// When this creature enters, create two 1/1 white Cat creature tokens with lifelink.
import { and, anthem, createTokens, defineCard, etb, is } from '../../motor/api.ts';

export default defineCard({
  name: 'Regal Caracal',
  faces: [{
    abilities: [
      // ruling 2: todos os outros Cats seus, não só as fichas; ruling 1: vínculo com a vida repetido não soma (CR 702.15f)
      anthem(and(is.subtype('Cat'), is.yours, is.other), () => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'lifelink' }], 'Os outros Cats que você controla recebem +1/+1 e têm vínculo com a vida.'),
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Cat 1/1 vínculo', 2); }, { text: 'Quando esta criatura entra, crie duas fichas de criatura Cat 1/1 brancas com vínculo com a vida.' }),
    ],
  }],
  rulings: {
    1: 'teste: as fichas já têm vínculo com a vida e ganham de novo do Caracal: o dano de cada uma dá a vida uma vez só',
    2: 'teste: os outros Cats seus recebem +1/+1 e vínculo com a vida; ao entrar, cria dois Cats 1/1 com vínculo com a vida',
  },
});
