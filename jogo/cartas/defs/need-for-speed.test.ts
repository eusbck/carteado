import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

describe('Need for Speed', () => {
  it('sacrifique um terreno: a criatura alvo ganha ímpeto', () => {
    const tg = setup({ battlefield: [['Need for Speed', 'Forest', { name: 'Indomitable Ancients', ready: false }], []] });
    tg.choose('Sacrifique', ['Forest']).activate('Need for Speed').resolve();
    expect(tg.find('Forest')).toBeNull();
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'haste')).toBe(true);
  });
});
