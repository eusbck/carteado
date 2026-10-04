import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const florestas = (n: number) => Array(n).fill('Forest');

describe('Tend the Sprigs', () => {
  it('busca um terreno básico virado; com sete terrenos depois disso, cria um Treefolk', () => {
    const tg = setup({ battlefield: [florestas(6), []], hand: [['Tend the Sprigs'], []], library: [['Plains'], []] });
    tg.choose('terreno básico', ['Plains']).cast('Tend the Sprigs').resolve();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    expect(tg.pt(tg.bf('Treefolk'))).toEqual([3, 4]);
  });
  it('terrenos e Treefolk somam para os sete', () => {
    const tg = setup({ battlefield: [[...florestas(5), { name: 'Treefolk', token: true }], []], hand: [['Tend the Sprigs'], []], library: [['Plains'], []] });
    tg.choose('terreno básico', ['Plains']).cast('Tend the Sprigs').resolve();
    expect(tg.all('Treefolk').length).toBe(2);
  });
  it('com menos de sete, só busca o terreno', () => {
    const tg = setup({ battlefield: [florestas(3), []], hand: [['Tend the Sprigs'], []], library: [['Plains'], []] });
    tg.choose('terreno básico', ['Plains']).cast('Tend the Sprigs').resolve();
    expect(tg.find('Plains')).not.toBeNull();
    expect(tg.find('Treefolk')).toBeNull();
  });
});
