import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Clockspinning';

describe(N, () => {
  it('escolhe o tipo de marcador e se tira ou põe na resolução', () => {
    const tg = setup({ battlefield: [['Island'], [{ name: 'Spellseeker', counters: { '+1/+1': 2, charge: 1 } }]], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Não pagar']).choose('permanente ou carta suspensa alvo', ['Spellseeker']);
    tg.choose('escolha um marcador', ['+1/+1']).choose('tirar ou pôr', ['Pôr mais um marcador +1/+1']).cast(N).resolve();
    expect(tg.state.objects[tg.bf('Spellseeker')].counters['+1/+1']).toBe(3);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
  it('um permanente sem marcadores não muda; com a recompra paga, volta para a mão', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], ['Sol Ring']], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Pagar: recompra {3}']).choose('permanente ou carta suspensa alvo', ['Sol Ring']).cast(N).resolve();
    expect(tg.state.objects[tg.bf('Sol Ring')].counters).toEqual({});
    expect(tg.names(0, 'hand')).toEqual([N]);
  });
  it('mira uma carta suspensa no exílio e tira um marcador de tempo', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [[N], []], exile: [[{ name: 'Rousing Refrain', counters: { time: 3 } }], []] });
    tg.choose('custo adicional opcional', ['Não pagar']).choose('permanente ou carta suspensa alvo', ['Rousing Refrain']);
    tg.choose('tirar ou pôr', ['Tirar um marcador time']).cast(N).resolve();
    expect(tg.state.objects[tg.find('Rousing Refrain', 'exile')!].counters.time).toBe(2);
  });
});
