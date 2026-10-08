// Grave Venerations
// When this enchantment enters, you become the monarch.
// At the beginning of your end step, if you're the monarch, return up to one target creature card from your graveyard to
// your hand.
// Whenever a creature you control dies, each opponent loses 1 life and you gain 1 life.
import { becomeMonarch, defineCard, etb, gainLife, is, loseLife, moveObjects, on, t, tgt, triggered, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Grave Venerations',
  faces: [{
    abilities: [
      // rulings 1-5: monarca (CR 724) — compra na etapa final e troca por dano de combate (motor: rule:monarch*)
      etb(function* (c) { becomeMonarch(c.g, c.you); }, { text: 'Quando este encantamento entra, você se torna o monarca.' }),
      triggered(on.endStep('you'), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        condition: (c) => c.g.state.monarch === c.you,
        targets: [upTo(1, t.card('graveyard', is.creature, 'até uma carta de criatura alvo no seu cemitério'))],
        text: 'No início da sua etapa final, se você for o monarca, devolva até uma carta de criatura alvo do seu cemitério para a sua mão.',
      }),
      triggered(on.dies((c, l) => l.controller === c.you), function* (c) {
        for (const op of c.g.opponents(c.you)) loseLife(c.g, op, 1, c.source);
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que uma criatura que você controla morre, cada oponente perde 1 de vida e você ganha 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 724.2 — monarca muda pelo dano de combate',
    2: 'teste: o monarca compra na própria etapa final',
    3: 'regra geral: CR 724.4 — monarca que sai do jogo passa o título',
    4: 'regra geral: CR 724.2 — a compra já disparada não muda',
    5: 'regra geral: CR 724.1 — só um monarca por vez',
  },
});
