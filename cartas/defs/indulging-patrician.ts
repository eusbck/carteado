// Indulging Patrician
// Flying
// Lifelink
// At the beginning of your end step, if you gained 3 or more life this turn, each opponent loses 3 life.
import { defineCard, keywords, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Indulging Patrician',
  faces: [{
    abilities: [
      ...keywords('flying', 'lifelink'),
      triggered(on.endStep('you'), function* (c) {
        for (const op of c.g.opponents(c.you)) loseLife(c.g, op, 3, c.source);
      }, {
        // rulings 1, 3: olha a vida ganha no turno, verificada ao disparar (CR 603.4)
        condition: (c) => c.g.state.turnStats[c.you].lifeGained >= 3,
        text: 'No início da sua etapa final, se você ganhou 3 ou mais de vida neste turno, cada oponente perde 3 de vida.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: conta vida ganha mesmo com perdas maiores no turno',
    2: 'regra geral: o texto fixa 3 de perda',
    3: 'teste: com menos de 3 de vida ganha, não dispara',
    4: 'não se aplica: Gigante de Duas Cabeças fora do escopo',
  },
});
