import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Permission Denied';

describe(N, () => {
  it('anula a mágica que não é de criatura; os oponentes não conjuram mais mágicas que não são de criatura no turno', () => {
    const tg = setup({ active: 1, battlefield: [['Plains', 'Island'], ['Forest', 'Forest', 'Forest']], hand: [[N], ['Sol Ring', 'Lotus Petal', 'Silver Myr']] });
    tg.cast('Sol Ring').pass();
    tg.script.push((d) => { const i = d.kind === 'select' ? d.items.find((x) => x.label === 'Sol Ring') : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.cast(N).resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.canCast('Lotus Petal')).toBe(false);
    expect(tg.canCast('Silver Myr')).toBe(true);
  });
});