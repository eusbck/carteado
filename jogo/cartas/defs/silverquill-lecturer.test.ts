import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Silverquill Lecturer';

describe(N, () => {
  it('demonstrando uma mágica de criatura, você e o oponente escolhido ficam cada um com uma ficha cópia', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], hand: [['Silver Myr'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    tg.yes('Demonstrar', true);
    tg.cast('Silver Myr').resolveAll();
    const myrs = tg.all('Silver Myr');
    expect(myrs).toHaveLength(3);
    expect(myrs.filter((id) => tg.state.objects[id].controller === 0)).toHaveLength(2);
    expect(myrs.filter((id) => tg.state.objects[id].controller === 1)).toHaveLength(1);
    expect(myrs.filter((id) => tg.state.objects[id].isToken)).toHaveLength(2);
  });

  it('sem copiar, nenhum oponente copia', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], hand: [['Silver Myr', 'Sol Ring'], []] });
    tg.yes('Demonstrar', false);
    tg.cast('Silver Myr').resolveAll();
    expect(tg.all('Silver Myr')).toHaveLength(1);
    // mágica que não é de criatura não dispara
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Demonstrar')) throw new Error('não devia disparar'); return null; });
    tg.passTo('upkeep', 1).passTo('main1', 0);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.all('Sol Ring')).toHaveLength(1);
  });
});