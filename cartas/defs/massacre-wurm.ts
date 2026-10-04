// Massacre Wurm
// When this creature enters, creatures your opponents control get -2/-2 until end of turn.
// Whenever a creature an opponent controls dies, that player loses 2 life.
import { allCreatures, controllerOf, defineCard, etb, loseLife, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Massacre Wurm',
  faces: [{
    abilities: [
      etb(function* (c) {
        // CR 611.2c: o conjunto afetado é travado na resolução (ruling 2)
        untilEndOfTurn(c, allCreatures(c.g).filter((id) => c.g.isOpponent(c.you, controllerOf(c.g, id))), [{ k: 'pt', p: -2, t: -2 }]);
      }, { text: 'Quando entra, as criaturas que seus oponentes controlam recebem -2/-2 até o fim do turno.' }),
      triggered(on.dies((c, l) => c.g.isOpponent(c.you, l.controller)), function* (c) {
        loseLife(c.g, c.event.controller as number, 2, c.source);
      }, { text: 'Sempre que uma criatura que um oponente controla morre, esse jogador perde 2 de vida.' }),
    ],
  }],
  rulings: {
    1: 'teste: criaturas que morrem pelo -2/-2 também fazem o jogador perder 2',
    2: 'teste: criatura que entra depois não recebe -2/-2',
    3: 'regra geral: CR 704.3 (ações de estado antes dos gatilhos irem para a pilha; testes/cenarios Q-SBA)',
    4: 'regra geral: CR 603.10a (olhar para trás; testado em Blood Artist)',
  },
});
