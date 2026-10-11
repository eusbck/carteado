import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Growing Ranks';

describe(N, () => {
  it('na sua manutenção, popula; com várias fichas, você escolhe qual copiar', () => {
    const tg = setup({ active: 1, battlefield: [[N, { name: 'Horse', token: true }, { name: 'Pegasus 1/1', token: true }], []] });
    tg.choose('Popular', ['Pegasus']);
    tg.passTo('main1', 0);
    expect(tg.all('Pegasus')).toHaveLength(2);
    expect(tg.all('Horse')).toHaveLength(1);
  });

  it('a ficha nova não copia os marcadores da original', () => {
    const tg = setup({ active: 1, battlefield: [[N, { name: 'Horse', token: true, counters: { '+1/+1': 2 } }], []] });
    tg.passTo('main1', 0);
    const pts = tg.all('Horse').map((id) => tg.pt(id).join('/')).sort();
    expect(pts).toEqual(['5/5', '7/7']);
  });

  it('sem ficha de criatura, popular não faz nada', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Silver Myr'], []] });
    tg.passTo('main1', 0);
    expect(tg.all('Silver Myr')).toHaveLength(1);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].isToken)).toHaveLength(0);
  });
});