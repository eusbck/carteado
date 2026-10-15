import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const SIGIL = 'Sigil of the Empty Throne';

describe(SIGIL, () => {
  it('o Angel é criado antes de a mágica de encantamento resolver', () => {
    const tg = setup({ battlefield: [[SIGIL, 'Plains', 'Plains', 'Plains'], []], hand: [['Ghostly Prison'], []] });
    tg.cast('Ghostly Prison').resolve();
    expect(tg.all('Angel')).toHaveLength(1);
    expect(tg.find('Ghostly Prison', 'stack')).not.toBeNull();
    expect(tg.pt(tg.all('Angel')[0])).toEqual([4, 4]);
  });

  it('conjurar o próprio Sigil não dispara', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains'], []], hand: [[SIGIL], []] });
    tg.cast(SIGIL).resolveAll();
    expect(tg.find(SIGIL)).not.toBeNull();
    expect(tg.all('Angel')).toHaveLength(0);
  });
});
