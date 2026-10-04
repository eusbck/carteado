// Habilidades que vêm das regras, não de cartas: mana intrínseca dos tipos básicos de
// terreno (CR 305.6) e as habilidades do monarca (CR 725.2).

import { becomeMonarch, draw } from './actions.ts';
import { defineAbility, type ManaAbilityDef, type TriggeredDef } from './defs.ts';
import type { Color } from './types.ts';

for (const c of ['W', 'U', 'B', 'R', 'G'] as Color[]) {
  defineAbility<ManaAbilityDef>(`basic:${c}`, {
    kind: 'mana', cost: [{ k: 'tap' }], produce: () => [[c]], text: `{T}: Adicione {${c}}.`,
  });
}

// CR 725.2: "No início da etapa final do monarca, ele compra uma carta" e
// "Sempre que uma criatura causar dano de combate ao monarca, o controlador dela se torna o monarca."
defineAbility<TriggeredDef>('rule:monarchDraw', {
  kind: 'triggered', on: { kind: 'batch', match: () => false }, text: 'Monarca: compre uma carta.',
  *effect(c) { yield* draw(c.g, c.you, 1); },
});

defineAbility<TriggeredDef>('rule:monarchSteal', {
  kind: 'triggered', on: { kind: 'batch', match: () => false }, text: 'Monarca: quem causou dano de combate ao monarca se torna o monarca.',
  *effect(c) { becomeMonarch(c.g, (c.event.player as number) ?? c.you); },
});
