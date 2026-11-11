import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Roaming Throne';

describe(N, () => {
  it('conforme entra, escolhe um tipo de criatura e passa a ser desse tipo; tem resguardo {2}', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Mind Stone', 'Island'], []], hand: [[N], []] });
    tg.choose('Roaming Throne: escolha um tipo', ['Wizard']).cast(N).resolveAll();
    const c = chars(tg.g, tg.bf(N));
    expect(c.subtypes).toEqual(expect.arrayContaining(['Golem', 'Wizard']));
    expect(c.abilities.some((a) => a.kw === 'ward')).toBe(true);
  });
  it('o gatilho de entrar de uma criatura do tipo escolhido dispara duas vezes', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], hand: [['Spellseeker'], []] });
    tg.state.objects[tg.bf(N)].choices.creatureType = 'Wizard';
    tg.g.bump();
    tg.refresh();
    tg.cast('Spellseeker').resolve();
    expect(tg.state.zones.stack).toHaveLength(2);
  });
  it('dois Roaming Thrones com o mesmo tipo fazem o gatilho disparar três vezes; outro tipo não', () => {
    const tg = setup({ battlefield: [[N, N, 'Island', 'Island', 'Island'], []], hand: [['Spellseeker'], []] });
    for (const id of tg.all(N)) tg.state.objects[id].choices.creatureType = 'Wizard';
    tg.g.bump();
    tg.refresh();
    tg.cast('Spellseeker').resolve();
    expect(tg.state.zones.stack).toHaveLength(3);
    const tg2 = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], hand: [['Spellseeker'], []] });
    tg2.state.objects[tg2.bf(N)].choices.creatureType = 'Elf';
    tg2.g.bump();
    tg2.refresh();
    tg2.cast('Spellseeker').resolve();
    expect(tg2.state.zones.stack).toHaveLength(1);
  });
});
