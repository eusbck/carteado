// Prismari Command
// Choose two —
// • Prismari Command deals 2 damage to any target.
// • Target player draws two cards, then discards two cards.
// • Target player creates a Treasure token.
// • Destroy target artifact.
import { createTokens, dealDamage, defineCard, destroy, discard, draw, modal, t, tgt, tgtPlayer, tgtRef } from '../../motor/api.ts';

export default defineCard({
  name: 'Prismari Command',
  faces: [{
    spell: {
      // rulings 1-2: resolve se algum alvo continua legal e faz o que puder (CR 608.2b)
      modes: modal(2, 2, [
        {
          text: 'Causa 2 de dano a qualquer alvo', targets: [t.any()],
          *effect(c) { const r = tgtRef(c); if (r) dealDamage(c.g, [{ source: c.source, target: r, amount: 2, combat: false }]); },
        },
        {
          text: 'O jogador alvo compra duas cartas e depois descarta duas', targets: [t.player(undefined, 'jogador alvo que compra e descarta')],
          *effect(c) { const p = tgtPlayer(c); if (p === null) return; yield* draw(c.g, p, 2); yield* discard(c.g, p, 2); },
        },
        {
          text: 'O jogador alvo cria uma ficha de Tesouro', targets: [t.player(undefined, 'jogador alvo que cria o Tesouro')],
          *effect(c) { const p = tgtPlayer(c); if (p !== null) yield* createTokens(c.g, p, 'Treasure', 1); },
        },
        {
          text: 'Destrua o artefato alvo', targets: [t.artifact()],
          *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
        },
      ]),
    },
  }],
  rulings: {
    1: 'teste: com um alvo ilegal, os outros modos ainda acontecem',
    2: 'regra geral: CR 608.2b — com todos os alvos ilegais, nada acontece',
  },
});
