// Vito, Thorn of the Dusk Rose
// Whenever you gain life, target opponent loses that much life.
// {3}{B}{B}: Creatures you control gain lifelink until end of turn.
import { activated, creaturesOf, defineCard, loseLife, on, t, tgtPlayer, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Vito, Thorn of the Dusk Rose',
  faces: [{
    abilities: [
      // rulings 3-4: um gatilho por evento de ganho de vida
      triggered(on.youGainLife(), function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) loseLife(c.g, p, c.event.amount as number, c.source);
      }, { targets: [t.opponent()], text: 'Sempre que você ganha vida, o oponente alvo perde essa quantidade de vida.' }),
      // CR 611.2c: só as criaturas que você controla quando a habilidade resolve
      activated('{3}{B}{B}', function* (c) {
        untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'addKeyword', kw: 'lifelink' }]);
      }, { text: '{3}{B}{B}: As criaturas que você controla ganham vínculo com a vida até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: perder vida não é dano: o vínculo com a vida de Vito não ganha vida de novo',
    2: 'regra geral: CR 104.4b — uma repetição obrigatória continua até alguém vencer ou quebrá-la (motor)',
    3: 'teste: duas criaturas com vínculo com a vida causando dano de combate disparam duas vezes',
    4: 'regra geral: CR 119.9 — ganhar vida "para cada" é um evento só (motor/actions.ts gainLife)',
    5: 'não se aplica: Gigante de Duas Cabeças não é jogado aqui',
  },
});
