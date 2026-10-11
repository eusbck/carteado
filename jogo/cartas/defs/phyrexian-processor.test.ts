import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Phyrexian Processor';
const ilhas = Array(8).fill('Island');

describe(N, () => {
  it('ao entrar, você paga vida; {4}, {T}: cria um Minion X/X preto com X igual à vida paga', () => {
    const tg = setup({ battlefield: [ilhas, []], hand: [[N], []] });
    tg.number('quanta vida você paga', 6).cast(N).resolveAll();
    expect(tg.life(0)).toBe(34);
    tg.activate(N).resolveAll();
    const ficha = tg.bf('Minion');
    expect(tg.pt(ficha)).toEqual([6, 6]);
    expect(tg.state.objects[ficha].controller).toBe(0);
  });

  it('pagando 0 de vida, as fichas são 0/0 e morrem', () => {
    const tg = setup({ battlefield: [ilhas, []], hand: [[N], []] });
    tg.number('quanta vida você paga', 0).cast(N).resolveAll();
    expect(tg.life(0)).toBe(40);
    tg.activate(N).resolveAll();
    expect(tg.find('Minion')).toBeNull();
  });
});