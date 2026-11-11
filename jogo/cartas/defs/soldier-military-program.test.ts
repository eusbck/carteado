import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'SOLDIER Military Program';

describe(C, () => {
  it('sem comandante: um modo só (cria a ficha)', () => {
    const tg = setup({ battlefield: [[C], []], step: 'main1' });
    tg.choose('Escolha um modo', ['Crie uma ficha de criatura Soldier 1/1 branca']);
    tg.passTo('beginCombat');
    tg.resolveAll();
    expect(tg.all('Soldier').length).toBe(1);
  });
  it('com um comandante, escolhe os dois modos', () => {
    const tg = setup({ battlefield: [[C, { name: 'Zack Fair', commander: true }], []], step: 'main1' });
    tg.choose('os dois', ['Crie uma ficha de criatura Soldier 1/1 branca', 'Coloque um marcador +1/+1 em cada um de até dois Soldiers que você controla']);
    tg.choose('Até dois Soldiers', ['Soldier', 'Zack Fair']);
    tg.passTo('beginCombat');
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Soldier')].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[tg.bf('Zack Fair')].counters['+1/+1']).toBe(1);
  });
});
