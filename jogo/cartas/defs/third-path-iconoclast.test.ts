import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

const N = 'Third Path Iconoclast';

describe(N, () => {
  it('mágica que não é de criatura (artefato) cria um Soldier artefato incolor', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Sol Ring'], []] });
    tg.cast('Sol Ring').resolveAll();
    const s = tg.bf('Soldier');
    expect(chars(tg.g, s).types).toEqual(['Artifact', 'Creature']);
    expect(chars(tg.g, s).colors).toEqual([]);
  });

  it('mágica de criatura não cria', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Island'], []], hand: [['Wall of Omens'], []], library: [['Island'], []] });
    tg.cast('Wall of Omens').resolveAll();
    expect(tg.find('Soldier')).toBeNull();
  });
});
