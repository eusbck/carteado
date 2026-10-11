// Alicia Masters, Skilled Sculptor
// At the beginning of combat on your turn, if you've cast a noncreature spell this turn, create a Treasure token.
// Sense the Good — At the beginning of your end step, each player gains control of all creatures they own.
import { allCreatures, controllerOf, createTokens, defineCard, gainControl, on, triggered } from '../../motor/api.ts';
import { noCombateSeConjurou } from '../quarteto.ts';

export default defineCard({
  name: 'Alicia Masters, Skilled Sculptor',
  faces: [{
    abilities: [
      noCombateSeConjurou(function* (c) { yield* createTokens(c.g, c.you, 'Treasure', 1); }, {
        text: 'No início do combate no seu turno, se você conjurou uma mágica que não é de criatura neste turno, crie uma ficha de Treasure.',
      }),
      triggered(on.endStep('you'), function* (c) {
        // efeito de controle sem prazo, com marca de tempo nova (CR 613.7): passa por cima dos anteriores
        for (const id of allCreatures(c.g)) {
          const dono = c.g.state.objects[id].owner;
          if (controllerOf(c.g, id) !== dono && !c.g.state.players[dono].left) gainControl(c.g, id, dono, { kind: 'permanent' }, c.source);
        }
      }, { text: 'Sentir o Bem — No início da sua etapa final, cada jogador ganha o controle de todas as criaturas de que é dono.' }),
    ],
  }],
  rulings: {},
});
