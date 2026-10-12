import { describe, expect, it } from 'vitest';
import { attach } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Cloud, Midgar Mercenary';

describe(N, () => {
  it('ao entrar busca um Equipamento para a mão', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], []], hand: [[N], []], library: [['Island', 'Genji Glove', 'Island'], ['Island']] });
    tg.script.push((d) => { const i = d.kind === 'select' && d.prompt.includes('Equipamento') ? d.items.find((x) => x.label === 'Genji Glove') : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 1]);
    expect(tg.names(0, 'hand')).toEqual(['Genji Glove']);
  });

  it('equipado, os gatilhos de Cloud e dos Equipamentos anexados a ele disparam uma vez a mais', () => {
    const tg = setup({ battlefield: [[N, 'Sword of Feast and Famine'], []], hand: [[], ['Island', 'Swamp', 'Forest']] });
    attach(tg.g, tg.bf('Sword of Feast and Famine'), tg.bf(N));
    tg.refresh();
    for (let i = 0; i < 2; i++) tg.script.push((d) => (d.kind === 'select' && /[Dd]escart/.test(d.prompt) ? { kind: 'select', ids: [d.items[0].id] } : null));
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(1, 'hand')).toHaveLength(1);
  });
});