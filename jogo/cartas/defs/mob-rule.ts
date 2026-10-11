// Mob Rule
// Choose one —
// • Gain control of all creatures with power 4 or greater until end of turn. Untap those creatures. They gain haste until
// end of turn.
// • Gain control of all creatures with power 3 or less until end of turn. Untap those creatures. They gain haste until end
// of turn.
import { allCreatures, defineCard, gainControl, modal, power, untap, untilEndOfTurn } from '../../motor/api.ts';
import type { Ctx, Gen } from '../../motor/defs.ts';

function* rouba(c: Ctx, passa: (forca: number) => boolean): Gen<void> {
  // ruling 2: o conjunto é fixado na resolução; ruling 3: vale também para as que já são suas ou já estão desviradas
  const ids = allCreatures(c.g).filter((id) => passa(power(c.g, id)));
  for (const id of ids) gainControl(c.g, id, c.you, { kind: 'endOfTurn' }, c.source);
  for (const id of ids) untap(c.g, id);
  if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'haste' }]);
}

export default defineCard({
  name: 'Mob Rule',
  faces: [{
    spell: {
      // ruling 1: o modo é escolhido ao conjurar
      modes: modal(1, 1, [
        { text: 'Ganhe o controle de todas as criaturas com força 4 ou mais até o fim do turno. Desvire essas criaturas. Elas ganham ímpeto até o fim do turno', *effect(c) { yield* rouba(c, (f) => f >= 4); } },
        { text: 'Ganhe o controle de todas as criaturas com força 3 ou menos até o fim do turno. Desvire essas criaturas. Elas ganham ímpeto até o fim do turno', *effect(c) { yield* rouba(c, (f) => f <= 3); } },
      ]),
    },
  }],
  rulings: {
    1: 'regra geral: CR 601.2b — o modo é escolhido ao conjurar (motor/stack.ts)',
    2: 'regra geral: CR 611.2c — o conjunto de criaturas é fixado na resolução; a força depois não importa',
    3: 'teste: força 3 ou menos: rouba, desvira e dá ímpeto às criaturas pequenas, inclusive as suas',
    4: 'regra geral: CR 613.1b — trocar o controle da criatura não troca o das Auras e Equipamentos presos a ela',
  },
});
