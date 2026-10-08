// Cartas ainda sem definição: ficam registradas como pendentes. Podem ser jogadas, e o
// efeito é aplicado à mão pelo controlador (modo manual); o log registra o que foi feito.

import { allOracleNames } from '../motor/oracle.ts';
import { registry, defineCard } from '../motor/defs.ts';
import { resetStaticIndex } from '../motor/chars.ts';
import { resetTriggerIndex } from '../motor/triggers.ts';

export function registrarPendentes(): void {
  for (const name of allOracleNames()) {
    if (!registry.cards.has(name)) defineCard({ name, faces: [{}, {}], pending: true });
  }
  resetStaticIndex();
  resetTriggerIndex();
}

export function pendentes(): string[] {
  return [...registry.cards.values()].filter((c) => c.pending).map((c) => c.name);
}
