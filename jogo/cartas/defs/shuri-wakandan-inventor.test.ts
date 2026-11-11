import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Shuri, Wakandan Inventor', () => {
  it('artefatos custam {1} a menos; um artefato vira cópia de outro', () => {
    const tg = setup({ battlefield: [['Shuri, Wakandan Inventor', 'Island', 'Ornithopter', 'Sol Ring'], []], hand: [['Fabricate'], []] });
    tg.choose('vira a cópia', ['Ornithopter']).choose('o modelo', ['Sol Ring']).activate('Shuri, Wakandan Inventor', 'cópia').resolve();
    expect(tg.all('Sol Ring').length).toBe(2);
  });
});
