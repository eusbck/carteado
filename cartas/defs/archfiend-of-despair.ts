// Archfiend of Despair
// Flying
// Your opponents can't gain life.
// At the beginning of each end step, each opponent loses life equal to the life that player lost this turn. (Damage
// causes loss of life.)
import { defineCard, keyword, loseLife, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Archfiend of Despair',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 119.7: ganhos de vida dos oponentes simplesmente não acontecem
      staticAbility({
        rules: { cantGainLife: (c, p) => c.g.isOpponent(c.you, p) },
        text: 'Seus oponentes não podem ganhar vida.',
      }),
      triggered(on.endStep('each'), function* (c) {
        // ruling 3: a quantidade é lida na resolução (o dano conta como perda de vida, CR 120.3a);
        // ruling 1: só a vida perdida conta, ganhos não descontam
        const perdas = c.g.opponents(c.you).map((p) => ({ p, n: c.g.state.turnStats[p].lifeLost }));
        for (const { p, n } of perdas) loseLife(c.g, p, n, c.source);
      }, { text: 'No início de cada etapa final, cada oponente perde uma quantidade de vida igual à vida que aquele jogador perdeu neste turno. (Dano causa perda de vida.)' }),
    ],
  }],
  rulings: {
    1: 'teste: conta só a vida perdida, mesmo que o jogador tenha ganhado vida no turno',
    2: 'não se aplica: Gigante de Duas Cabeças fora do escopo (cada jogador tem o próprio total de vida)',
    3: 'teste: ruling 3 — com dois Archfiends, o segundo a resolver vê a perda causada pelo primeiro',
  },
});
