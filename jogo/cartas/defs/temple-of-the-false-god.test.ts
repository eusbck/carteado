import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Temple of the False God', () => {
  it('com cinco terrenos (ele incluso), adiciona {C}{C}', () => expect(alternativasDeMana('Temple of the False God', ['Plains', 'Plains', 'Plains', 'Plains'])).toEqual(['CC']));
  it('com menos de cinco terrenos, não pode ser ativado', () => expect(alternativasDeMana('Temple of the False God', ['Plains', 'Plains', 'Plains'])).toEqual([]));
});
