// Shadow of Mortality
// If your life total is less than your starting life total, this spell costs {X} less to cast, where X is the difference.
import { defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Shadow of Mortality',
  faces: [{
    // CR 601.2f: reduz só a parte genérica; o valor de mana continua 15 (CR 202.3)
    selfCost: (c) => {
      const s = c.g.state;
      const dif = s.config.startingLife - s.players[c.you].life;
      return dif > 0 ? { reduce: dif } : {};
    },
  }],
  rulings: { 1: 'não se aplica: não há Gigante de Duas Cabeças no jogo' },
});
