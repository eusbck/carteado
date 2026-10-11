// Flawless Forgery
// Casualty 3 (As you cast this spell, you may sacrifice a creature with power 3 or greater. When you do, copy this spell
// and you may choose a new target for the copy.)
// Exile target instant or sorcery card from an opponent's graveyard. Copy that card. You may cast the copy without
// paying its mana cost.
import { casualty, createObject, defineCard, exile, is, mayCastFree, t, tgt } from '../../motor/api.ts';

const baixa = casualty(3);

export default defineCard({
  name: 'Flawless Forgery',
  faces: [{
    // CR 702.153a: custo adicional opcional de sacrificar + gatilho de conjuração que copia a mágica
    additionalCosts: [baixa.cost],
    abilities: [baixa.trigger],
    spell: {
      targets: [t.card('graveyard', is.instantOrSorcery, 'carta de instantânea ou feitiço alvo no cemitério de um oponente', 'opponent')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const def = c.g.state.objects[id].def;
        // ruling 1: a carta exilada continua exilada
        yield* exile(c.g, [id]);
        // CR 707.12: a cópia da carta é criada no exílio e conjurada dali durante a resolução, sem pagar
        const copia = createObject(c.g, { def, owner: c.you, controller: c.you, zone: 'exile', isCopy: true, copyOf: { def, face: 0 } });
        yield* mayCastFree(c.g, c.you, copia.id, `Flawless Forgery: conjurar uma cópia de ${def} sem pagar o custo de mana?`);
      },
    },
  }],
  rulings: {
    1: 'teste: exila a carta do cemitério do oponente e conjura uma cópia dela de graça; a carta continua exilada',
    2: 'regra geral: CR 702.153a — custo adicional opcional e gatilho que copia a mágica (cartas/defs/a-little-chat.test.ts)',
    3: 'regra geral: CR 702.153a — só uma criatura é sacrificada e a mágica é copiada uma vez (motor/conjurar-alternativo.ts casualty)',
    4: 'regra geral: CR 702.153a — a cópia resolve antes da original (cartas/defs/a-little-chat.test.ts)',
    5: 'regra geral: CR 707.10 — a cópia não é conjurada (motor/stack.ts copySpell)',
  },
});
