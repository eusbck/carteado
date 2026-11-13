import { describe, expect, it } from 'vitest';
import { sacrifice } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Baloth Prime';

describe(N, () => {
  it('entra virada com seis marcadores de atordoamento', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest'], []], hand: [[N], []] });
    tg.cast(N).resolve();
    const b = tg.state.objects[tg.bf(N)];
    expect(b.tapped).toBe(true);
    expect(b.counters.stun).toBe(6);
  });
  it('cada terreno sacrificado cria uma Besta 4/4 virada e tira um marcador de atordoamento', () => {
    const tg = setup({ battlefield: [[{ name: N, tapped: true, counters: { stun: 6 } }, 'Forest', 'Forest', 'Forest', 'Forest', 'Swamp'], []] });
    tg.choose('Sacrifique', ['Swamp']).activate(N).resolveAll();
    expect(tg.life(0)).toBe(42);
    const bestas = tg.all('Beast');
    expect(bestas.length).toBe(1);
    expect(tg.state.objects[bestas[0]].tapped).toBe(true);
    expect(tg.pt(bestas[0])).toEqual([4, 4]);
    expect(tg.state.objects[tg.bf(N)].counters.stun).toBe(5);
  });
  it('sacrificada junto com um terreno, ainda cria a Besta', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []] });
    tg.run(sacrifice(tg.g, [tg.bf(N), tg.bf('Forest')]));
    tg.resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.all('Beast').length).toBe(1);
  });
});
