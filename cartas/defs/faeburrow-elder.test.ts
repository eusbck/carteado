import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Faeburrow Elder', () => {
  it('sozinha, é 2/2 e produz {G}{W}', () => {
    const tg = setup({ battlefield: [['Faeburrow Elder', 'Sol Ring', 'Swamp'], []] });
    expect(tg.pt(tg.bf('Faeburrow Elder'))).toEqual([2, 2]);
    expect(hasKw(tg.g, tg.bf('Faeburrow Elder'), 'vigilance')).toBe(true);
    expect(alternativasDeMana('Faeburrow Elder', ['Sol Ring', 'Swamp'])).toEqual(['WG']);
  });
  it('conta só as cinco cores (no máximo +5/+5 e cinco manas)', () => {
    // Killian é branco e preto; Rootha é azul e vermelho; o oponente não conta
    const meus = ['Killian, Ink Duelist', 'Elvish Mystic', 'Wall of Omens', 'Rootha, Mastering the Moment'];
    const tg = setup({ battlefield: [['Faeburrow Elder', ...meus], ['Ravenous Chupacabra']] });
    expect(tg.pt(tg.bf('Faeburrow Elder'))).toEqual([5, 5]);
    expect(alternativasDeMana('Faeburrow Elder', meus)).toEqual(['WUBRG']);
    expect(alternativasDeMana('Faeburrow Elder', ['Killian, Ink Duelist'])).toEqual(['WBG']);
  });
});
