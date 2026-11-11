import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Darksteel Plate';

describe(N, () => {
  it('CR 702.12b: o Equipamento e a criatura equipada são indestrutíveis; a outra criatura não', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', N, 'Elvish Mystic', 'Wall of Omens'], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).activate(N, 'Equipar').resolve();
    runEffect(tg, destroy(tg.g, [tg.bf(N), tg.bf('Elvish Mystic'), tg.bf('Wall of Omens')]));
    expect(tg.find(N)).not.toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
  });

  it('CR 704.5f: indestrutível não salva a criatura com resistência 0', () => {
    const tg = setup({ battlefield: [[{ name: N, attachTo: 'Elvish Mystic' }, 'Elvish Mystic'], []] });
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    tg.g.state.objects[tg.bf('Elvish Mystic')].counters['-1/-1'] = 1;
    tg.g.bump();
    tg.refresh().settle();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find(N)).not.toBeNull();
  });
});
