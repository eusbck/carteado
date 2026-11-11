// Lieutenant Hikaru Sulu
// Whenever Lieutenant Sulu becomes tapped, he explores. (Reveal the top card of your library. Put that card into your
// hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it into your
// graveyard.)
// {2}{U}: Target creature can't be blocked this turn.
import { activated, defineCard, explore, on, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Lieutenant Hikaru Sulu',
  faces: [{
    abilities: [
      // CR 701.44: explorar; virar por qualquer motivo (atacar, custo, efeito) dispara
      triggered(on.custom((e, c) => e.type === 'tap' && e.obj === c.source), function* (c) {
        yield* explore(c.g, c.source);
      }, { text: 'Sempre que o Lieutenant Sulu fica virado, ele explora. (Revele a carta do topo do seu grimório. Se for terreno, ponha-a na sua mão. Senão, coloque um marcador +1/+1 nesta criatura e devolva a carta ao topo ou ponha-a no seu cemitério.)' }),
      activated('{2}{U}', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:cantBeBlocked' }]);
      }, { targets: [t.creature(undefined, 'criatura alvo')], text: '{2}{U}: A criatura alvo não pode ser bloqueada neste turno.' }),
    ],
  }],
  rulings: {},
});
