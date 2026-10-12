// Mana Drain
// Counter target spell. At the beginning of your next main phase, add an amount of {C} equal to that spell's mana value.
import { addMana, counter, defineAbility, defineCard, delayed, manaValue, on, t, tgt, triggered } from '../../motor/api.ts';

// ruling 2: dispara no início da sua próxima fase principal, seja a primeira ou a segunda do turno
const MANA = defineAbility('Mana Drain:mana', triggered(on.custom((e, c) => e.type === 'step' && (e.step === 'main1' || e.step === 'main2') && e.active === c.you), function* (c) {
  const n = Number(c.data.n ?? 0);
  if (n > 0) addMana(c.g, c.you, Array(n).fill('C'), { source: c.source });
}, { text: 'No início da sua próxima fase principal, adicione {C} igual ao valor de mana daquela mágica.' }));

export default defineCard({
  name: 'Mana Drain',
  faces: [{
    spell: {
      targets: [t.spell()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        // ruling 1: a mana vem mesmo que a mágica não possa ser anulada; o valor de mana é o dela na pilha (com o X)
        const n = manaValue(c.g, id);
        yield* counter(c.g, id);
        delayed(c, MANA.id!, { data: { n } });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2b — com o alvo ilegal a mágica não resolve e não há mana depois; se a mágica só não pôde ser anulada, a mana vem (cartas/defs/mana-drain.ts)',
    2: 'teste: anula a mágica e, no início da sua próxima fase principal, adiciona {C} igual ao valor de mana dela',
  },
});