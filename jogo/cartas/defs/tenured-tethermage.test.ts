import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Tenured Tethermage';

describe(N, () => {
  it('sacrificando um terreno, cria duas fichas de Heartwood viradas', () => {
    const tg = setup({ battlefield: [['Mountain', 'Forest', 'Forest', 'Swamp'], []], hand: [[N], []] });
    tg.choose('você pode sacrificar um terreno', ['Swamp']).cast(N).resolve().resolve();
    expect(tg.find('Swamp')).toBeNull();
    const fichas = tg.all('Heartwood');
    expect(fichas.length).toBe(2);
    expect(fichas.every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
  it('vire dois artefatos: dois marcadores +1/+1', () => {
    const tg = setup({ battlefield: [[N, { name: 'Heartwood', token: true }, { name: 'Heartwood', token: true }], []] });
    tg.activate(N).resolve();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
  });
});
