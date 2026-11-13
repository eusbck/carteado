import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Gifts Ungiven';
const ilhas = ['Island', 'Island', 'Island', 'Island'];

describe(N, () => {
  it('quatro cartas de nomes diferentes; o oponente escolhe duas para o cemitério e as outras vão para a mão', () => {
    const tg = setup({ battlefield: [ilhas, []], hand: [[N], []], library: [['Opt', 'Opt', 'Ponder', 'Sol Ring', 'Forest'], []] });
    let segunda: string[] = [];
    tg.choose('procure a 1ª', ['Opt']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('procure a 2ª')) return null;
      segunda = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Ponder')!.id] };
    });
    tg.choose('procure a 3ª', ['Sol Ring']).choose('procure a 4ª', ['Forest']);
    tg.choose('Gifts Ungiven: escolha duas', ['Opt', 'Sol Ring']);
    tg.cast(N).resolve();
    expect(segunda).toEqual(['Forest', 'Ponder', 'Sol Ring']);
    expect(tg.names(0, 'hand').sort()).toEqual(['Forest', 'Ponder']);
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Opt', 'Sol Ring'].sort());
  });
  it('com duas cartas ou menos, as duas vão para o cemitério', () => {
    const tg = setup({ battlefield: [ilhas, []], hand: [[N], []], library: [['Opt', 'Ponder', 'Forest'], []] });
    tg.choose('procure a 1ª', ['Opt']).choose('procure a 2ª', ['Ponder']).choose('procure a 3ª', []);
    let perguntou = false;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('escolha duas')) perguntou = true; return null; });
    tg.cast(N).resolve();
    expect(perguntou).toBe(false);
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Opt', 'Ponder'].sort());
  });
});
