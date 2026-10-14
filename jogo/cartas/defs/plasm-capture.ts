// Plasm Capture
// Counter target spell. At the beginning of your next first main phase, add X mana in any combination of colors, where
// X is that spell's mana value.
import { addMana, chooseColor, counter, defineAbility, defineCard, delayed, manaValue, on, t, tgt, triggered } from '../../motor/api.ts';
import type { Color } from '../../motor/types.ts';

// gatilho atrasado (CR 603.7): na próxima primeira fase principal de quem conjurou
const MANA = defineAbility('Plasm Capture:mana', triggered(on.firstMain(), function* (c) {
  const n = (c.data.x as number | undefined) ?? 0;
  if (n <= 0) return;
  const cores: Color[] = [];
  for (let i = 0; i < n; i++) cores.push(yield* chooseColor(c.g, c.you, `Plasm Capture: cor da mana ${i + 1} de ${n}`));
  addMana(c.g, c.you, cores, { source: c.source });
}, { text: 'No início da sua próxima primeira fase principal, adicione X manas em qualquer combinação de cores.' }));

export default defineCard({
  name: 'Plasm Capture',
  faces: [{
    spell: {
      targets: [t.spell()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        // ruling 1: o valor de mana na pilha conta o X escolhido (CR 202.3e)
        const x = manaValue(c.g, id);
        yield* counter(c.g, id);
        delayed(c, MANA.id!, { data: { x } });
      },
    },
  }],
  rulings: {
    1: 'teste: com X na mágica anulada, o valor de mana conta o X',
    2: 'teste: a mana vem na primeira fase principal do seu próximo turno, não na segunda deste',
  },
});
