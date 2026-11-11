import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Bloom Tender', () => {
  it('terrenos e artefatos incolores não contam', () => {
    // só a própria Bloom Tender (verde): {G}
    expect(alternativasDeMana('Bloom Tender', ['Sol Ring', 'Swamp', 'Island'])).toEqual(['G']);
  });
  it('um permanente de várias cores conta para cada uma, e no máximo uma mana de cada cor', () => {
    // Killian é branco e preto; Rootha é azul e vermelho; Elvish Mystic repete o verde
    expect(alternativasDeMana('Bloom Tender', ['Killian, Ink Duelist', 'Rootha, Mastering the Moment', 'Elvish Mystic'])).toEqual(['WUBRG']);
    expect(alternativasDeMana('Bloom Tender', ['Killian, Ink Duelist'])).toEqual(['WBG']);
  });
});
