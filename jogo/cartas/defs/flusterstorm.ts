// Flusterstorm
// Counter target instant or sorcery spell unless its controller pays {1}.
// Storm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the
// copies.)
import { counter, defineCard, is, mayPay, t, tgt } from '../../motor/api.ts';
import { storm } from '../esquilos.ts';
import { podePagar } from '../twitch.ts';

export default defineCard({
  name: 'Flusterstorm',
  faces: [{
    // CR 702.40a (cartas/esquilos.ts): rulings 1 a 5
    abilities: [storm()],
    spell: {
      targets: [t.spell(is.instantOrSorcery, 'mágica instantânea ou de feitiço alvo')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const quem = c.g.state.objects[id]?.stack?.controller;
        // CR 118.12a: "a menos que pague" = o jogador pode pagar; se não pagar, a mágica é anulada
        if (quem !== undefined && !c.g.state.players[quem].left && podePagar(c, quem, '{1}') && (yield* mayPay(c, quem, '{1}', 'a mágica não ser anulada (Flusterstorm)'))) return;
        yield* counter(c.g, id);
      },
    },
  }],
  rulings: {
    1: 'teste: conta as mágicas conjuradas antes no turno, inclusive as anuladas',
    2: 'teste: cada cópia pode ter um alvo novo',
    3: 'regra geral: CR 702.40a — as cópias não são conjuradas e não contam para a tempestade (cartas/esquilos.ts)',
    4: 'regra geral: CR 702.40a — a tempestade é um gatilho; anulado, não há cópias (cartas/esquilos.ts)',
    5: 'regra geral: CR 707.10 — cada cópia é anulada separadamente (motor/stack.ts)',
  },
});
