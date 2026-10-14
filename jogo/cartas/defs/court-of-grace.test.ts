import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Court of Grace';

describe(N, () => {
  it('ao entrar, você se torna o monarca; na manutenção, sendo monarca, cria um Angel 4/4 com voar', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.state.monarch).toBe(0);
    tg.passTo('main1', 1).passTo('main1', 0);
    const anjo = tg.bf('Angel');
    const c = chars(tg.g, anjo);
    expect([c.power, c.toughness]).toEqual([4, 4]);
  });

  it('sem ser o monarca, cria um Spirit 1/1 com voar', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.state.monarch = 1;
    tg.refresh();
    tg.passTo('main1', 1).passTo('main1', 0);
    expect(tg.find('Spirit')).not.toBeNull();
    expect(tg.find('Angel')).toBeNull();
  });
});
