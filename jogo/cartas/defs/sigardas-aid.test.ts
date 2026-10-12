import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Sigarda's Aid";

describe(N, () => {
  it('Equipamentos podem ser conjurados como se tivessem lampejo; o que entra pode ser anexado à criatura alvo', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Plains', 'Plains', 'Serra Angel'], []], hand: [["Hero's Blade", 'Silver Myr'], []] });
    tg.pass();
    expect(tg.canCast('Silver Myr')).toBe(false);
    expect(tg.canCast("Hero's Blade")).toBe(true);
    tg.yes("Sigarda's Aid", true).choose('criatura alvo que você controla', ['Serra Angel']).cast("Hero's Blade").resolveAll();
    expect(tg.state.objects[tg.bf("Hero's Blade")].attachedTo).toBe(tg.bf('Serra Angel'));
  });
});