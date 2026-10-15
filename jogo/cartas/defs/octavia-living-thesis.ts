// Octavia, Living Thesis
// This spell costs {8} less to cast if you have eight or more instant and/or sorcery cards in your graveyard.
// Ward {8}
// Magecraft — Whenever you cast or copy an instant or sorcery spell, target creature has base power and toughness 8/8
// until end of turn.
import { defineCard, magecraft, t, tgt, untilEndOfTurn, ward } from '../../motor/api.ts';
import { instantesEFeiticosNoCemiterio } from '../saque.ts';

export default defineCard({
  name: 'Octavia, Living Thesis',
  faces: [{
    // CR 601.2f: redução do custo total, só o genérico
    selfCost: (c) => ({ reduce: instantesEFeiticosNoCemiterio(c.g, c.you).length >= 8 ? 8 : 0 }),
    abilities: [
      ...ward('{8}'),
      {
        ...magecraft(function* (c) {
          const id = tgt(c);
          // CR 613.4b: força e resistência base (camada 7b); marcadores e modificadores continuam valendo por cima
          if (id !== null) untilEndOfTurn(c, [id], [{ k: 'setPT', p: 8, t: 8 }]);
        }, 'Sempre que você conjura ou copia uma mágica instantânea ou de feitiço, a criatura alvo tem força e resistência base 8/8 até o fim do turno.'),
        targets: [t.creature()],
      },
    ],
  }],
  rulings: {
    1: 'regra geral: cada magecraft tem o próprio efeito com a mesma condição (motor/mecanicas.ts magecraft)',
    2: 'regra geral: cada magecraft tem o próprio efeito com a mesma condição (motor/mecanicas.ts magecraft)',
    3: 'teste: copiar uma instantânea também dispara',
    4: 'regra geral: CR 707.10 — cada cópia criada dispara uma vez (motor/stack.ts copySpell emite copySpell por cópia)',
    5: 'regra geral: CR 707.12 — copiar uma carta fora da pilha não dispara; conjurar a cópia dispara (cartas/saque.ts conjuraCopiasGratis)',
    6: 'regra geral: CR 702.21a — cada resguardo dispara separadamente (motor/mecanicas.ts)',
  },
});
