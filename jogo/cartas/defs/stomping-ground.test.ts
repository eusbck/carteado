import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Stomping Ground";

describe(C, () => {
  it('pagando 2 de vida entra desvirado', () => {
    const tg = setup({ hand: [[C], []] });
    tg.yes('Pagar 2');
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Pagar 2') ? { kind: 'select', ids: [d.items[0].id] } : null));
    tg.lenient = true;
    tg.play(C);
    tg.settle();
    expect(tg.find(C)).not.toBeNull();
  });
});
