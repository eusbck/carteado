import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Duergar Hedge-Mage';

describe(N, () => {
  it('com duas Mountains e duas Plains, pode destruir um artefato e um encantamento', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Plains', 'Plains'], ['Sol Ring', 'Righteous Cause']], hand: [[N], []] });
    tg.yes('artefato alvo', true).yes('encantamento alvo', true);
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Righteous Cause')).toBeNull();
  });

  it('sem dois terrenos do tipo, a habilidade não dispara', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains', 'Plains'], ['Sol Ring', 'Righteous Cause']], hand: [[N], []] });
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('artefato alvo')) throw new Error('não devia disparar'); return null; });
    tg.yes('encantamento alvo', false);
    tg.cast(N).resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.find('Righteous Cause')).not.toBeNull();
  });
});