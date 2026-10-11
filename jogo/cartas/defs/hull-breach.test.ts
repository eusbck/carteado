import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Hull Breach';
const terrenos = ['Mountain', 'Forest'];

describe(N, () => {
  it('destrói o artefato alvo', () => {
    const tg = setup({ battlefield: [terrenos, ['Sol Ring', 'Bitter Reunion']], hand: [[N], []] });
    tg.choose('modo', ['Destrua o artefato alvo']).choose('artefato alvo', ['Sol Ring']).cast(N).resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Bitter Reunion')).not.toBeNull();
  });

  it('destrói o encantamento alvo', () => {
    const tg = setup({ battlefield: [terrenos, ['Sol Ring', 'Bitter Reunion']], hand: [[N], []] });
    tg.choose('modo', ['Destrua o encantamento alvo']).choose('encantamento alvo', ['Bitter Reunion']).cast(N).resolveAll();
    expect(tg.find('Bitter Reunion')).toBeNull();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });

  it('destrói um artefato e um encantamento', () => {
    const tg = setup({ battlefield: [terrenos, ['Sol Ring', 'Bitter Reunion']], hand: [[N], []] });
    tg.choose('modo', ['Destrua o artefato alvo e o encantamento alvo']).choose('artefato alvo', ['Sol Ring']).choose('encantamento alvo', ['Bitter Reunion']).cast(N).resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual([]);
  });
});
