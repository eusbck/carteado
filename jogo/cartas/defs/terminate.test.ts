import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Terminate', () => {
  it('destrói a criatura alvo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Mountain'], ['Indomitable Ancients']], hand: [['Terminate'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Terminate').resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
  });
});
