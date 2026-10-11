import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Comet Storm';
const montanhas = (n: number) => Array(n).fill('Mountain');

describe(N, () => {
  it('CR 702.33c: reforçada duas vezes com X = 3, causa 3 de dano a cada um de três alvos diferentes', () => {
    // {3}{R}{R} + {1} + {1} = sete manas
    const tg = setup({ players: 3, battlefield: [montanhas(7), ['Indomitable Ancients'], []], hand: [[N], [], []] });
    tg.number('quantas vezes', 2).number('valor de X', 3).choose('qualquer alvo', ['Bruno', 'Carla', 'Indomitable Ancients']);
    tg.cast(N).resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 37, 37]);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
    expect(tg.all('Mountain').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });

  it('sem reforçar, um alvo só', () => {
    const tg = setup({ players: 3, battlefield: [montanhas(5), [], []], hand: [[N], [], []] });
    let maximo = -1;
    tg.number('quantas vezes', 0).number('valor de X', 3);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('qualquer alvo')) return null;
      maximo = d.max;
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Carla')!.id] };
    });
    tg.cast(N).resolveAll();
    expect(maximo).toBe(1);
    expect([tg.life(1), tg.life(2)]).toEqual([40, 37]);
  });

  it('se um dos alvos sai, os outros ainda recebem o dano', () => {
    const tg = setup({ battlefield: [montanhas(5), ['Indomitable Ancients']], hand: [[N], []] });
    tg.number('quantas vezes', 1).number('valor de X', 2).choose('qualquer alvo', ['Bruno', 'Indomitable Ancients']);
    tg.cast(N);
    tg.run(destroy(tg.g, [tg.bf('Indomitable Ancients')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
  });
});
