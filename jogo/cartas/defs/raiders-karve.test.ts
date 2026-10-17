import { describe, expect, it } from 'vitest';
import { buildView } from '../../motor/view.ts';
import { setup } from '../../testes/harness.ts';

const N = "Raiders' Karve";

describe(N, () => {
  it('ao atacar, um terreno no topo pode entrar virado; outra carta fica', () => {
    const tg = setup({ battlefield: [[N, 'Ripjaw Raptor'], []], library: [['Canopy Vista', 'Sol Ring'], []] });
    tg.choose('Tripular:', ['Ripjaw Raptor']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    tg.yes("Raiders' Karve", true);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf('Canopy Vista')].tapped).toBe(true);
    expect(tg.names(0, 'library')).toEqual(['Sol Ring']);

    const nao = setup({ battlefield: [[N, 'Ripjaw Raptor'], []], library: [['Sol Ring'], []] });
    nao.choose('Tripular:', ['Ripjaw Raptor']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    nao.attack([[N, 1]]).passTo('declareBlockers');
    expect(nao.names(0, 'library')).toEqual(['Sol Ring']);
  });

  it('você olha a carta do topo mesmo quando não é terreno; os outros só sabem que você olhou', () => {
    const tg = setup({ battlefield: [[N, 'Ripjaw Raptor'], []], library: [['Sol Ring'], []] });
    tg.choose('Tripular:', ['Ripjaw Raptor']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    tg.attack([[N, 1]]).passTo('declareBlockers');
    const minha = buildView(tg.g, 0, null).log.map((l) => l.text).filter((t) => t.includes("Raiders' Karve"));
    const dele = buildView(tg.g, 1, null).log.map((l) => l.text).filter((t) => t.includes("Raiders' Karve"));
    expect(minha.some((t) => t.includes('Sol Ring'))).toBe(true);
    expect(dele.length).toBeGreaterThan(0);
    expect(dele.some((t) => t.includes('Sol Ring'))).toBe(false);
  });
});
