// Archmage's Charm
// Choose one —
// • Counter target spell.
// • Target player draws two cards.
// • Gain control of target nonland permanent with mana value 1 or less.
import { counter, defineCard, draw, gainControl, is, modal, t, tgt, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: "Archmage's Charm",
  faces: [{
    spell: {
      modes: modal(1, 1, [
        { text: 'Anule a mágica alvo', targets: [t.spell()], *effect(c) { const id = tgt(c); if (id !== null) yield* counter(c.g, id); } },
        { text: 'O jogador alvo compra duas cartas', targets: [t.player()], *effect(c) { const p = tgtPlayer(c); if (p !== null) yield* draw(c.g, p, 2); } },
        {
          text: 'Ganhe o controle do permanente não terreno alvo com valor de mana 1 ou menos',
          // rulings 1 e 2: ficha que não é cópia vale 0; X no campo vale 0 (CR 202.3e)
          targets: [t.nonlandPermanent(is.mvAtMost(1), 'permanente não terreno alvo com valor de mana 1 ou menos')],
          *effect(c) { const id = tgt(c); if (id !== null) gainControl(c.g, id, c.you, { kind: 'permanent' }, c.source); },
        },
      ]),
    },
  }],
  rulings: {
    1: 'teste: ganha o controle de uma ficha que não é cópia (valor de mana 0)',
    2: 'regra geral: CR 202.3e — X no campo vale 0 (motor/chars.ts)',
  },
});
