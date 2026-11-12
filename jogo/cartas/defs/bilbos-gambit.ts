// Bilbo's Gambit
// Gift a Treasure (You may promise an opponent a gift as you cast this spell. If you do, they create a Treasure token
// before its other effects. It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")
// Return target spell to its owner's hand. If the gift was promised, players can't cast spells this turn.
import { createTokens, defineAbility, defineCard, returnToHand, ruleEffect, t, tgt } from '../../motor/api.ts';
import type { StaticDef } from '../../motor/defs.ts';

// "os jogadores não podem conjurar mágicas neste turno" (CR 101.2: a proibição vence a permissão)
const NINGUEM_CONJURA = defineAbility<StaticDef>("Bilbo's Gambit:ninguemConjura", { kind: 'static', rules: { cantCastSpells: () => true } });

const PRESENTE = 'regra geral: CR 702.174 — o presente é prometido a um oponente ao conjurar e dado quando a mágica resolve, antes dos outros efeitos; só uma vez (motor/dsl.ts gift)';

export default defineCard({
  name: "Bilbo's Gambit",
  faces: [{
    // CR 702.174f: "Gift a Treasure": o oponente escolhido cria uma ficha de Treasure
    gift: { label: 'um Treasure', *give(c, to) { yield* createTokens(c.g, to, 'Treasure', 1); } },
    spell: {
      targets: [t.spell()],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* returnToHand(c.g, [id]);
        if (c.paid.gift) ruleEffect(c, NINGUEM_CONJURA.id!, { kind: 'endOfTurn' });
      },
    },
  }],
  rulings: {
    1: PRESENTE,
    2: 'regra geral: CR 707.10 — a cópia da mágica tem o presente prometido ao mesmo oponente (motor/stack.ts)',
    3: PRESENTE,
    4: 'teste: com o presente, o oponente cria um Treasure, a mágica volta para a mão e ninguém conjura mais neste turno',
    5: 'regra geral: CR 608.2b — se a mágica não resolve, o presente não é dado (motor/stack.ts)',
    6: PRESENTE,
  },
});
