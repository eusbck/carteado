// Sidar Kondo of Jamuraa
// Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of
// turn.)
// Creatures your opponents control without flying or reach can't block creatures with power 2 or less.
// Partner
import { controllerOf, defineCard, hasKw, keyword, on, power, staticAbility, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Sidar Kondo of Jamuraa',
  faces: [{
    abilities: [
      // CR 702.25: flanqueamento — um gatilho por criatura bloqueadora sem flanqueamento
      keyword('flanking'),
      triggered(on.custom((e, c) => (e.type === 'blockers'
        ? e.blocks.filter(([b, a]) => a === c.source && !hasKw(c.g, b, 'flanking')).map(([b]) => ({ bloqueador: b }))
        : false)), function* (c) {
        const b = c.event.bloqueador as ObjId;
        if (c.g.state.objects[b]?.zone === 'battlefield') untilEndOfTurn(c, [b], [{ k: 'pt', p: -1, t: -1 }]);
      }, { text: 'Flanqueamento (sempre que uma criatura sem flanqueamento bloqueia esta criatura, a bloqueadora recebe -1/-1 até o fim do turno).' }),
      // rulings 1-2: só ao declarar bloqueadores; vale mesmo quando outro jogador ataca
      staticAbility({
        rules: {
          canBlock: (c, bloqueador, atacante) => !(c.g.isOpponent(c.you, controllerOf(c.g, bloqueador)) && !hasKw(c.g, bloqueador, 'flying') && !hasKw(c.g, bloqueador, 'reach') && power(c.g, atacante) <= 2),
        },
        text: 'Criaturas que seus oponentes controlam sem voar ou alcance não podem bloquear criaturas com força 2 ou menos.',
      }),
      keyword('partner'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 509.1b — depois de bloquear, reduzir a força não desfaz o bloqueio',
    2: 'teste: vale mesmo quando outro jogador ataca',
    3: 'não se aplica: cada deck tem um comandante só (Sidar não é comandante)',
    4: 'não se aplica: cada deck tem um comandante só',
    5: 'não se aplica: cada deck tem um comandante só',
    6: 'não se aplica: cada deck tem um comandante só',
    7: 'não se aplica: cada deck tem um comandante só',
    8: 'não se aplica: cada deck tem um comandante só',
    9: 'não se aplica: cada deck tem um comandante só',
  },
});
