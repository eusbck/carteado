// Mizzix's Mastery
// Exile target card that's an instant or sorcery from your graveyard. For each card exiled this way, copy it, and you
// may cast the copy without paying its mana cost. Exile Mizzix's Mastery.
// Overload {5}{R}{R}{R} (You may cast this spell for its overload cost. If you do, change "target" in its text to
// "each.")
import { defineCard, exile, is, moveObjects, overload, overloaded, t, tgt } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { conjuraCopiasGratis, instantesEFeiticosNoCemiterio } from '../saque.ts';

export default defineCard({
  name: "Mizzix's Mastery",
  faces: [{
    // CR 702.96a-b: com sobrecarga, "alvo" vira "cada" e a mágica não tem alvos (ruling 2)
    altCosts: [overload('{5}{R}{R}{R}')],
    spell: {
      targets: [t.card('graveyard', is.instantOrSorcery, 'carta de instantânea ou de feitiço alvo no seu cemitério')],
      *effect(c) {
        let cartas: ObjId[];
        if (overloaded(c)) cartas = instantesEFeiticosNoCemiterio(c.g, c.you);
        else {
          const id = tgt(c);
          cartas = id === null ? [] : [id];
        }
        const exiladas = cartas.length ? (yield* exile(c.g, cartas)).filter((x): x is ObjId => x !== null && x !== undefined && c.g.state.objects[x]?.zone === 'exile') : [];
        // rulings 5, 9, 10: as cópias são conjuradas agora, na ordem escolhida; as não conjuradas deixam de existir
        yield* conjuraCopiasGratis(c, exiladas, "Mizzix's Mastery");
        // ruling 11: a própria Mastery está na pilha e não é copiada; no fim, ela vai para o exílio
        if (c.g.state.objects[c.source]?.zone === 'stack') yield* moveObjects(c.g, [{ id: c.source, to: 'exile' }], 'effect');
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 118.9a — conjurada sem pagar o custo de mana, não pode pagar a sobrecarga (motor/stack.ts castSpell free)',
    2: 'teste: com sobrecarga, exila todas as instantâneas e feitiços do cemitério e conjura cópias de graça',
    3: 'regra geral: CR 702.96b — com sobrecarga, não tem alvos (motor/conjurar-alternativo.ts overload)',
    4: 'regra geral: CR 601.2f — custo total a partir do custo de sobrecarga; o valor de mana não muda (motor/stack.ts)',
    5: 'teste: exila a carta alvo, conjura uma cópia dela de graça e a Mastery vai para o exílio',
    6: 'regra geral: CR 118.9a — sem pagar o custo de mana não se escolhe custo alternativo; custos adicionais continuam (motor/stack.ts)',
    7: 'regra geral: CR 107.3b — sem pagar o custo de mana, X vale 0 (motor/stack.ts)',
    8: 'teste: exila a carta alvo, conjura uma cópia dela de graça e a Mastery vai para o exílio',
    9: 'teste: com sobrecarga, exila todas as instantâneas e feitiços do cemitério e conjura cópias de graça',
    10: 'teste: a cópia que não for conjurada deixa de existir',
    11: 'teste: com sobrecarga, exila todas as instantâneas e feitiços do cemitério e conjura cópias de graça',
  },
});
