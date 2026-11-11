// Vito, Thorn of the Dusk Rose
// Whenever you gain life, target opponent loses that much life.
// {3}{B}{B}: Creatures you control gain lifelink until end of turn.
import { activated, controlledBy, defineCard, isCreature, loseLife, on, t, tgtPlayer, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Vito, Thorn of the Dusk Rose',
  faces: [{
    abilities: [
      triggered(on.youGainLife(), function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) loseLife(c.g, p, c.event.amount as number, c.source);
      }, { targets: [t.opponent()], text: 'Sempre que você ganha vida, o oponente alvo perde essa quantidade de vida.' }),
      activated('{3}{B}{B}', function* (c) {
        const ids = controlledBy(c.g, c.you, (id) => isCreature(c.g, id));
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'lifelink' }]);
      }, { text: '{3}{B}{B}: As criaturas que você controla ganham vínculo com a vida até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 119.9 — cada ganho de vida é um evento e dispara uma vez (vínculo em várias criaturas no mesmo dano soma um evento por fonte)',
    2: 'regra geral: CR 611.2c — só as criaturas que você controla quando resolve ganham vínculo com a vida',
    3: 'regra geral: CR 119.3 — perder vida não é dano',
    4: 'regra geral: CR 603.2 — a vida ganha com 0 não dispara',
    5: 'regra geral: CR 800.4a — se o oponente saiu do jogo, a habilidade não tem alvo',
  },
});
