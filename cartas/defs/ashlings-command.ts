// Ashling's Command
// Choose two —
// • Create a token that's a copy of target Elemental you control.
// • Target player draws two cards.
// • Ashling's Command deals 2 damage to each creature target player controls.
// • Target player creates two Treasure tokens.
import { and, copiableValues, createTokens, creaturesOf, dealDamage, defineCard, draw, is, modal, t, tgt, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: "Ashling's Command",
  faces: [{
    spell: {
      // ruling 9: faz o que puder com os alvos legais (CR 608.2b)
      modes: modal(2, 2, [
        {
          text: 'Crie uma ficha que é cópia do Elemental alvo que você controla', targets: [t.permanent(and(is.subtype('Elemental'), is.yours), 'Elemental alvo que você controla')],
          // rulings 2-4, 6, 8: copia os valores copiáveis (o que ele copia, ou a ficha original)
          *effect(c) { const id = tgt(c); if (id !== null) yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, 1); },
        },
        {
          text: 'O jogador alvo compra duas cartas', targets: [t.player(undefined, 'jogador alvo que compra')],
          *effect(c) { const p = tgtPlayer(c); if (p !== null) yield* draw(c.g, p, 2); },
        },
        {
          text: 'Causa 2 de dano a cada criatura que o jogador alvo controla', targets: [t.player(undefined, 'jogador alvo cujas criaturas sofrem dano')],
          *effect(c) {
            const p = tgtPlayer(c);
            if (p !== null) dealDamage(c.g, creaturesOf(c.g, p).map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: 2, combat: false })));
          },
        },
        {
          text: 'O jogador alvo cria duas fichas de Tesouro', targets: [t.player(undefined, 'jogador alvo que cria os Tesouros')],
          *effect(c) { const p = tgtPlayer(c); if (p !== null) yield* createTokens(c.g, p, 'Treasure', 2); },
        },
      ]),
    },
  }],
  rulings: {
    1: 'regra geral: CR 205.3c — Kindred é tipo de carta com subtipos de criatura (dados Oracle)',
    2: 'regra geral: CR 707.9 — X vale 0 na cópia (valores copiáveis)',
    3: 'teste: copia o que o Elemental estiver copiando',
    4: 'regra geral: CR 707.5 — a ficha cópia dispara as próprias habilidades de entrar',
    5: 'regra geral: CR 205.3c — Kindred conta como tipo de carta',
    6: 'teste: a ficha cópia não copia marcadores',
    7: 'não se aplica: "tribal" não aparece nos dados',
    8: 'teste: cópia de ficha copia a ficha original',
    9: 'regra geral: CR 608.2b — faz o que puder com os alvos legais',
  },
});
