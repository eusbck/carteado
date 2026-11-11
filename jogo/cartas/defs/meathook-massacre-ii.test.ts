import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Meathook Massacre II";

describe(C, () => {
  it('com X=1 cada jogador sacrifica uma criatura; a do oponente volta para você se ele não pagar', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Swamp')], ['Wall of Omens']], hand: [[C], []], library: [['Opt'], ['Opt']] });
    tg.lenient = true;
    tg.script.push((d) => (d.kind === 'select' && d.player === 1 && d.prompt.includes('Meathook') ? { kind: 'select', ids: [d.items.find((i) => i.label === 'Não pagar')!.id] } : null));
    tg.number('X', 1).cast(C).resolve().resolveAll();
    const w = tg.find('Wall of Omens', 'battlefield', 0);
    expect(w).not.toBeNull();
    expect(tg.state.objects[w!].counters.finality).toBe(1);
  });
});
