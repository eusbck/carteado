import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Linvala, the Preserver';

describe(N, () => {
  it('com um oponente com mais vida e mais criaturas, ganha 5 e cria um Angel 3/3 com voar', () => {
    const tg = setup({ battlefield: [[], ['Slither Blade', 'Baleful Strix']] });
    tg.state.players[0].life = 30;
    tg.refresh();
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.life(0)).toBe(35);
    const anjo = tg.bf('Angel');
    const c = chars(tg.g, anjo);
    expect([c.power, c.toughness]).toEqual([3, 3]);
  });

  it('as condições são conferidas ao disparar e de novo ao resolver', () => {
    const tg = setup({ battlefield: [[], ['Slither Blade', 'Baleful Strix']] });
    tg.state.players[0].life = 30;
    tg.refresh();
    enterCard(tg, N, 0);
    // dispararam os dois; antes de resolver, Ana passa a ter mais vida e mais criaturas
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.state.players[0].life = 45;
    enterCard(tg, 'Segovian Angel', 0);
    enterCard(tg, 'Segovian Angel', 0);
    tg.resolveAll();
    expect(tg.life(0)).toBe(45);
    expect(tg.find('Angel')).toBeNull();
  });

  it('sem oponente com mais vida nem mais criaturas, nem dispara', () => {
    const tg = setup({ battlefield: [['Segovian Angel'], ['Slither Blade']] });
    enterCard(tg, N, 0);
    expect(tg.state.zones.stack).toHaveLength(0);
  });
});
