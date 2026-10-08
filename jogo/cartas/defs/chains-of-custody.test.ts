import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Chains of Custody', () => {
  it('exila até a Aura sair; a criatura encantada tem resguardo {2}', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Wall of Omens'], ['Sol Ring']], hand: [['Chains of Custody'], []], library: [['Island'], []] });
    tg.choose('criatura que você controla', ['Wall of Omens']).choose('oponente controla', ['Sol Ring']);
    tg.cast('Chains of Custody').resolve().resolve();
    expect(tg.names(1, 'exile')).toEqual(['Sol Ring']);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'ward')).toBe(true);
    tg.run(destroy(tg.g, [tg.bf('Chains of Custody')]));
    tg.resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
  it('se a Aura já saiu, nada é exilado', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Wall of Omens'], ['Sol Ring']], hand: [['Chains of Custody'], []], library: [['Island'], []] });
    tg.choose('criatura que você controla', ['Wall of Omens']).choose('oponente controla', ['Sol Ring']);
    tg.cast('Chains of Custody').resolve();
    tg.run(destroy(tg.g, [tg.bf('Chains of Custody')]));
    tg.resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.names(1, 'exile')).toEqual([]);
  });
});
