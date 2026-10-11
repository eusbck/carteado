import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Return to Dust';
const planicies = ['Plains', 'Plains', 'Plains', 'Plains'];

describe(N, () => {
  it('conjurada na sua fase principal, exila até dois artefatos ou encantamentos', () => {
    const tg = setup({ battlefield: [planicies, ['Sol Ring', 'Righteous Cause', 'Silver Myr']], hand: [[N], []] });
    tg.choose('artefato ou encantamento alvo', ['Sol Ring']).choose('outro artefato ou encantamento alvo', ['Righteous Cause']);
    tg.cast(N).resolveAll();
    expect(tg.find('Sol Ring', 'exile')).not.toBeNull();
    expect(tg.find('Righteous Cause', 'exile')).not.toBeNull();
    expect(tg.find('Silver Myr')).not.toBeNull();
  });

  it('fora da sua fase principal, só o primeiro alvo é exilado', () => {
    const tg = setup({ active: 1, battlefield: [planicies, ['Sol Ring', 'Righteous Cause']], hand: [[N], []] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    tg.choose('artefato ou encantamento alvo', ['Sol Ring']).choose('outro artefato ou encantamento alvo', ['Righteous Cause']);
    tg.cast(N).resolveAll();
    expect(tg.find('Sol Ring', 'exile')).not.toBeNull();
    expect(tg.find('Righteous Cause')).not.toBeNull();
  });
});