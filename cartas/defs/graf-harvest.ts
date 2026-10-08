// Graf Harvest
// Zombies you control have menace. (They can't be blocked except by two or more creatures.)
// {3}{B}, Exile a creature card from your graveyard: Create a 2/2 black Zombie creature token.
import { activated, and, anthem, cost, createTokens, defineCard, is } from '../../motor/api.ts';

export default defineCard({
  name: 'Graf Harvest',
  faces: [{
    abilities: [
      anthem(and(is.subtype('Zombie'), is.yours), () => [{ k: 'addKeyword', kw: 'menace' }],
        'Os Zombies que você controla têm ameaça (só podem ser bloqueados por duas ou mais criaturas).'),
      // exilar a carta é custo (CR 118, 602.2b): pago ao ativar, sem resposta no meio
      activated([...cost('{3}{B}'), { k: 'exileFromGraveyard', n: 1, filter: is.creature }], function* (c) {
        yield* createTokens(c.g, c.you, 'Zombie 2/2', 1);
      }, { text: '{3}{B}, Exile uma carta de criatura do seu cemitério: Crie uma ficha de criatura Zombie preta 2/2.' }),
    ],
  }],
  rulings: {},
});
