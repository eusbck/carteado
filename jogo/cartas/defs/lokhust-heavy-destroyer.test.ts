import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Lokhust Heavy Destroyer';

describe(N, () => {
  it('ao entrar, cada jogador sacrifica uma criatura; sem outra, você sacrifica o próprio Destroyer', () => {
    const tg = setup({ battlefield: [Array(4).fill('Swamp'), ['Serra Angel']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });

  it('desenterrada e sacrificada pelo próprio gatilho, é exilada em vez de ir ao cemitério', () => {
    const tg = setup({ battlefield: [Array(8).fill('Swamp'), ['Serra Angel']], graveyard: [[N], []] });
    tg.activate(N, 'Desenterrar').resolveAll();
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.names(0, 'exile')).toEqual([N]);
  });
});