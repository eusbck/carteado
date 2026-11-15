// Shoot the Sheriff
// Destroy target non-outlaw creature. (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws. Everyone else is fair game.)
import { defineCard, destroy, isOutlaw, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Shoot the Sheriff',
  faces: [{ spell: {
    targets: [t.creature((c, id) => !isOutlaw(c.g, id), 'criatura alvo que não seja fora da lei')],
    *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
  } }],
  rulings: {
    1: 'teste: um Mercenary também é fora da lei e não pode ser alvo',
    2: 'regra geral: CR 700.12 — basta qualquer um dos cinco tipos (motor/fora-da-lei.ts; testes/regras-fora-da-lei.test.ts)',
    3: 'regra geral: CR 205.3m, 700.12 — fora da lei não é tipo de criatura (testes/regras-fora-da-lei.test.ts)',
    4: 'regra geral: CR 700.12a — aqui o alvo é uma criatura no campo (motor/stack.ts)',
  },
});
