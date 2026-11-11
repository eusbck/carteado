// Gisa, the Hellraiser
// Ward—{2}, Pay 2 life.
// Skeletons and Zombies you control get +1/+1 and have menace.
// Whenever you commit a crime, create two tapped 2/2 blue and black Zombie Rogue creature tokens. This ability triggers
// only once each turn.
import { and, anthem, defineCard, is, or, triggered, ward } from '../../motor/api.ts';
import { voceCometeCrime } from '../crime.ts';
import { createTokens } from '../../motor/api.ts';

export default defineCard({
  name: 'Gisa, the Hellraiser',
  faces: [{
    abilities: [
      ...ward('{2}, Pay 2 life'),
      anthem(and(is.creature, is.yours, or(is.subtype('Skeleton'), is.subtype('Zombie'))), () => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'menace' }],
        'Os Skeletons e Zombies que você controla recebem +1/+1 e têm ameaça.'),
      triggered(voceCometeCrime(), function* (c) {
        yield* createTokens(c.g, c.you, 'Zombie Rogue', 2, { tapped: true });
      }, { oncePerTurn: true, text: 'Sempre que você comete um crime, crie duas fichas de criatura Zombie Rogue azuis e pretas 2/2 viradas. Esta habilidade dispara só uma vez a cada turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 700.13 — mirar um oponente, algo que ele controla ou uma carta no cemitério dele é um crime (cartas/crime.ts)',
    2: 'regra geral: CR 700.13a — uma mágica ou habilidade com vários alvos criminosos é um crime só',
    3: 'regra geral: CR 700.13 — o crime acontece ao pôr a mágica ou habilidade na pilha, mesmo se ela não resolver',
  },
});
