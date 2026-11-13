// Grief
// Menace
// When this creature enters, target opponent reveals their hand. You choose a nonland card from it. That player
// discards that card.
// Evoke—Exile a black card from your hand.
import { chars, chooseItems, defineCard, discard, etb, evoke, isLand, keyword, nameOf, t, tgtPlayer } from '../../motor/api.ts';
import { jog, objs, reg } from '../../motor/registro.ts';

const EVOCAR = evoke('', [{ k: 'exileFromHand', n: 1, filter: (c, id) => chars(c.g, id).colors.includes('B'), label: 'carta preta' }], 'exile uma carta preta da sua mão');

export default defineCard({
  name: 'Grief',
  faces: [{
    altCosts: [EVOCAR.altCost],
    abilities: [
      keyword('menace'),
      etb(function* (c) {
        const g = c.g;
        const p = tgtPlayer(c);
        if (p === null) return;
        const mao = g.state.zones.hand[p];
        reg(g, 'revela', { rule: '701.20' })`${jog(p)} revela a mão: ${objs(mao, undefined, ', ', 'vazia')}.`;
        const cands = mao.filter((id) => !isLand(g, id));
        if (!cands.length) return;
        const [esc] = yield* chooseItems(g, c.you, 'Grief: escolha uma carta que não seja terreno para o oponente descartar', cands.map((id) => ({ id: String(id), label: nameOf(g, id), obj: id, card: { def: g.state.objects[id].def } })), 1, 1);
        yield* discard(g, p, 1, { chooser: c.you, filter: (id) => String(id) === esc });
      }, { targets: [t.opponent()], text: 'Quando esta criatura entra, o oponente alvo revela a mão. Você escolhe uma carta que não seja terreno dela. Esse jogador descarta essa carta.' }),
      ...EVOCAR.abilities,
    ],
  }],
  rulings: {
    1: 'regra geral: CR 601.2f, 202.3 — o custo total parte do custo de evocar; o valor de mana continua 4 (motor/stack.ts)',
    2: 'teste: evocada, a habilidade de descartar e a de sacrificar disparam juntas e você escolhe a ordem',
  },
});
