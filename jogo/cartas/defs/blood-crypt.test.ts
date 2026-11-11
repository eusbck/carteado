import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Blood Crypt";

describe(C, () => {
  it('entra virado sem pagar', () => {
    const tg = setup({ hand: [[C], []] });
    tg.lenient = true;
    tg.script.push((d) => (d.kind === 'select' && /Pagar 2/.test(d.items.map((i) => i.label).join()) ? { kind: 'select', ids: [d.items.find((i) => !/Pagar/.test(i.label))!.id] } : null));
    tg.play(C); tg.settle();
    expect(tg.state.objects[tg.bf(C)].tapped).toBe(true);
  });
});
