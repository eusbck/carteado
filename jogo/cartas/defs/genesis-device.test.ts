import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Genesis Device';

describe(N, () => {
  it('ao entrar, põe um terreno básico do grimório no campo virado', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [[N], []], library: [['Strip Mine', 'Island'], []] });
    tg.choose('Genesis Device: procure', ['Island']).cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
  });
  it('a ativada sacrifica os terrenos escolhidos e busca outros tantos, virados', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Swamp', 'Swamp'], []], library: [['Strip Mine', 'Breeding Pool', 'Hex'], []] });
    tg.choose('Genesis Device: sacrifique', ['Swamp', 'Swamp']).choose('Genesis Device: procure', ['Strip Mine', 'Breeding Pool']);
    tg.activate(N).resolveAll();
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Swamp', 'Swamp'].sort());
    expect(tg.state.objects[tg.bf('Strip Mine')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Breeding Pool')].tapped).toBe(true);
  });
});
