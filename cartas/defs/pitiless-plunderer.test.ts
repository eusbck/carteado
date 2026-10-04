import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Pitiless Plunderer', () => {
  it('CR 603.10a: morrendo junto, dispara para as outras (não para si)', () => {
    const tg = setup({ battlefield: [['Pitiless Plunderer', 'Elvish Mystic', 'Arboreal Grazer', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Toxic Deluge'], []] });
    tg.number('valor de X', 4).cast('Toxic Deluge').resolve().resolveAll();
    expect(tg.find('Pitiless Plunderer')).toBeNull();
    expect(tg.all('Treasure').length).toBe(2);
  });
});
