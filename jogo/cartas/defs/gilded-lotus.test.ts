import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Gilded Lotus', () => {
  it('{T}: adiciona três manas de uma mesma cor', () => expect(alternativasDeMana('Gilded Lotus')).toEqual(['BBB', 'GGG', 'RRR', 'UUU', 'WWW']));
  it('com um terreno, paga uma mágica de quatro manas', () => {
    const tg = setup({ battlefield: [['Gilded Lotus', 'Forest'], []], hand: [['Harmonize'], []], library: [['Island', 'Island', 'Island'], []] });
    tg.cast('Harmonize').resolve();
    expect(tg.names(0, 'hand')).toHaveLength(3);
    expect(tg.state.objects[tg.bf('Gilded Lotus')].tapped).toBe(true);
  });
});
