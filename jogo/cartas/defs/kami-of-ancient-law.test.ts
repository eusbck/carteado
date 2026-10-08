import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Kami of Ancient Law', () => {
  it('sacrifique: destrói o encantamento alvo', () => {
    const tg = setup({ battlefield: [['Kami of Ancient Law'], ['Bastion of Remembrance']] });
    tg.choose('encantamento alvo', ['Bastion of Remembrance']).activate('Kami of Ancient Law').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Kami of Ancient Law']);
    expect(tg.names(1, 'graveyard')).toEqual(['Bastion of Remembrance']);
  });
});
