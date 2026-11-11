import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';
import { setup } from '../../testes/harness.ts';

const NOME = 'Command Chair';

describe(NOME, () => {
  it('CR 614.1c: entra virado', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Sol Ring', 'Sol Ring'], []], hand: [[NOME], []] });
    tg.cast(NOME).resolveAll();
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
  it('sem comandante, três manas de uma mesma cor', () => {
    expect(alternativasDeMana(NOME)).toEqual(['BBB', 'GGG', 'RRR', 'UUU', 'WWW']);
  });
  it('com o comandante (valor de mana 5) no campo, também X = 5 manas de uma cor', () => {
    const alts = alternativasDeMana(NOME, [{ name: 'Commander Spock', commander: true }]);
    expect(alts).toContain('GGGGG');
    expect(alts).toContain('UUU');
  });
});
