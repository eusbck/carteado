import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Leyline Dowser';

describe(N, () => {
  it('moa uma carta; uma instantânea moída pode ir para a mão, um terreno não', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], library: [['Opt', 'Forest'], []] });
    tg.yes('Leyline Dowser', true).activate(N, 'Moa').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Opt']);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });

  it('virar uma criatura lendária com enjoo de invocação desvira o artefato', () => {
    const tg = setup({
      battlefield: [[N, 'Island', 'Island', { name: 'Talrand, Sky Summoner', ready: false }, 'Wall of Omens'], []],
      library: [['Forest', 'Plains'], []],
    });
    tg.activate(N, 'Moa').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    // só a lendária é oferecida
    let oferecidas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura lendária desvirada')) return null;
      oferecidas = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(N, 'Desvire este artefato').resolve();
    expect(oferecidas).toEqual(['Talrand, Sky Summoner']);
    expect(tg.state.objects[tg.bf('Talrand, Sky Summoner')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(false);
  });
});
