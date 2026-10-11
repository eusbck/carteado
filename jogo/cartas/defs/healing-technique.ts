// Healing Technique
// Demonstrate (When you cast this spell, you may copy it. If you do, choose an opponent to also copy it. Players may
// choose new targets for their copies.)
// Return target card from your graveyard to your hand. You gain life equal to that card's mana value. Exile Healing
// Technique.
import { defineCard, demonstrate, gainLife, manaValue, moveObjects, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Healing Technique',
  faces: [{
    abilities: [demonstrate()],
    spell: {
      // "do seu cemitério": o de quem controla a mágica (a cópia do oponente mira o cemitério dele)
      targets: [t.card('graveyard', undefined, 'carta alvo do seu cemitério', 'you')],
      *effect(c) {
        const s = c.g.state;
        const id = tgt(c);
        if (id !== null && s.objects[id]?.zone === 'graveyard') {
          const valor = manaValue(c.g, id);
          yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
          gainLife(c.g, c.you, valor, c.source);
        }
        // a carta é exilada; a cópia deixa de existir sozinha
        const o = s.objects[c.source];
        if (o && o.zone === 'stack' && !o.isCopy) yield* moveObjects(c.g, [{ id: c.source, to: 'exile' }], 'effect');
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.144a — você decide copiar quando o gatilho de demonstrar resolve, antes da mágica original (motor/mecanicas.ts demonstrate)',
    2: 'regra geral: CR 702.144a — copiando, você escolhe um oponente, que também copia (motor/mecanicas.ts demonstrate)',
    3: 'regra geral: CR 707.10c — cada um pode escolher novos alvos para a própria cópia (motor/stack.ts copySpell)',
    4: 'regra geral: CR 707.10 — as cópias ficam acima da original na pilha e resolvem antes (motor/stack.ts copySpell)',
    5: 'teste: devolve a carta alvo do seu cemitério para a mão, você ganha vida igual ao valor de mana dela, e a mágica é exilada',
  },
});