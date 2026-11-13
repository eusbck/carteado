import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Breeding Pool";

describe(C, () => {
  it('sem pagar, entra virada', () => {
    const tg = setup({ hand: [[C], []] });
    tg.lenient = true;
    tg.script.push((d) => (d.kind === 'select' && d.items.some((i) => /Pagar/.test(i.label)) ? { kind: 'select', ids: [d.items.find((i) => !/Pagar/.test(i.label))!.id] } : null));
    tg.play(C); tg.settle();
    expect(tg.state.objects[tg.bf(C)].tapped).toBe(true);
  });
});
