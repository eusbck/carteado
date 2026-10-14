import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Seal of Cleansing';

describe(NOME, () => {
  it('sacrificar é o custo: o Seal sai do campo antes de a habilidade resolver', () => {
    const tg = setup({ battlefield: [[NOME], ['Sol Ring']] });
    tg.choose('artefato ou encantamento', ['Sol Ring']).activate(NOME);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
  });
});
