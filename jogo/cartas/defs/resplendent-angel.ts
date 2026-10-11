// Resplendent Angel
// Flying
// At the beginning of each end step, if you gained 5 or more life this turn, create a 4/4 white Angel creature token with
// flying and vigilance.
// {3}{W}{W}{W}: Until end of turn, this creature gets +2/+2 and gains lifelink.
import { activated, createTokens, defineCard, keyword, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Resplendent Angel',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.endStep('each'), function* (c) { yield* createTokens(c.g, c.you, 'Angel vigilância', 1); }, {
        // rulings 1-4 (CR 603.4): o total ganho no turno, em quantas vezes for, conferido quando a etapa final começa;
        // uma ficha só
        condition: (c) => c.g.state.turnStats[c.you].lifeGained >= 5,
        text: 'No início de cada etapa final, se você ganhou 5 ou mais de vida neste turno, crie uma ficha de criatura Angel 4/4 branca com voar e vigilância.',
      }),
      activated('{3}{W}{W}{W}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'lifelink' }]);
      }, { text: '{3}{W}{W}{W}: Até o fim do turno, esta criatura recebe +2/+2 e ganha vínculo com a vida.' }),
    ],
  }],
  rulings: {
    1: 'teste: tendo ganhado 5 ou mais de vida no turno, em mais de uma vez, cria um Angel 4/4 com voar e vigilância',
    2: 'teste: tendo ganhado 5 ou mais de vida no turno, em mais de uma vez, cria um Angel 4/4 com voar e vigilância',
    3: 'teste: com menos de 5 de vida ganha no turno, a habilidade não dispara',
    4: 'teste: tendo ganhado 5 ou mais de vida no turno, em mais de uma vez, cria um Angel 4/4 com voar e vigilância',
    5: 'não se aplica: Gigante de Duas Cabeças não existe no jogo',
  },
});