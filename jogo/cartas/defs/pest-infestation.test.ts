import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Pest Infestation', () => {
  it('cria o dobro de X fichas, quantos alvos forem destruídos', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest', 'Forest'], ['Sol Ring', 'Bastion of Remembrance']], hand: [['Pest Infestation'], []] });
    tg.number('valor de X', 2).choose('artefatos e/ou encantamentos', ['Sol Ring']).cast('Pest Infestation').resolve();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Bastion of Remembrance')).not.toBeNull();
    expect(tg.all('Pest').length).toBe(4);
  });
});
