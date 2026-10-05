import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';
import { destroy, exile } from '../../motor/api.ts';

describe('Hofri Ghostforge', () => {
  it('copia a criatura como estava no campo; quando a ficha sai, a carta exilada volta ao cemitério', () => {
    const tg = setup({ battlefield: [['Hofri Ghostforge', { name: 'Wall of Omens', counters: { '+1/+1': 2 } }], []], library: [['Island', 'Island'], []] });
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    const ficha = tg.bf('Wall of Omens');
    expect(tg.state.objects[ficha].isToken).toBe(true);
    expect(chars(tg.g, ficha).subtypes).toContain('Spirit');
    expect(tg.pt(ficha)).toEqual([1, 5]); // 0/4 impresso + 1/+1 de Hofri, sem os marcadores
    expect(hasKw(tg.g, ficha, 'trample')).toBe(true);
    expect(tg.names(0, 'exile')).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'hand')).toEqual(['Island']); // a cópia dispara o próprio "ao entrar"
    tg.run(destroy(tg.g, [ficha]));
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'exile')).toEqual([]);
  });
  it('sem a carta no cemitério, não cria ficha', () => {
    const tg = setup({ battlefield: [['Hofri Ghostforge', 'Elvish Mystic'], []] });
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.run(exile(tg.g, [tg.state.zones.graveyard[0][0]]));
    tg.resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
  });
});
