import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Pteramander';
const magicas = (n: number) => Array(n).fill('Opt');

describe(N, () => {
  it('com sete instantâneas e feitiços no cemitério, custa só {U}', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], graveyard: [magicas(7), []] });
    tg.activate(N).resolve();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(4);
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
  });

  it('sem instantâneas nem feitiços no cemitério, não dá para pagar com uma Ilha só', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], graveyard: [['Forest'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });

  it('dá para ativar com um marcador +1/+1 já nela, mas não põe nenhum', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 1 } }, 'Island'], []], graveyard: [magicas(7), []] });
    tg.activate(N).resolve();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1);
  });

  it('sem marcadores +1/+1 de novo, adapta outra vez', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], graveyard: [magicas(7), []] });
    tg.activate(N).resolve();
    tg.state.objects[tg.bf(N)].counters['+1/+1'] = 0;
    tg.refresh();
    tg.activate(N).resolve();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(4);
  });
});
