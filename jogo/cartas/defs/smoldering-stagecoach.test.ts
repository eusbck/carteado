import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

const N = 'Smoldering Stagecoach';

describe(N, () => {
  it('a força conta as instantâneas e os feitiços do cemitério', () => {
    const tg = setup({ battlefield: [[N], []], hand: [[N], []], graveyard: [['Opt', 'Serum Visions', 'Island'], []] });
    const id = tg.bf(N);
    expect(chars(tg.g, id).power).toBe(2);
    expect(chars(tg.g, id).toughness).toBe(5);
    expect(chars(tg.g, tg.find(N, 'hand', 0)!).power).toBe(2);
  });

  it('atacando, a próxima instantânea do turno tem cascata; a segunda não', () => {
    const tg = setup({
      battlefield: [[N, 'Indomitable Ancients', 'Island', 'Island', 'Island', 'Island'], []],
      hand: [['Think Twice', 'Think Twice'], []], graveyard: [['Opt'], []],
      library: [['Forest', 'Opt', 'Plains', 'Plains', 'Plains', 'Plains'], []],
    });
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.state.delayedTriggers).toHaveLength(2);
    tg.yes('Cascata', true).cast('Think Twice');
    // a cascata dispara ao conjurar a instantânea
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    expect(tg.find('Opt', 'stack')).not.toBeNull();
    tg.resolveAll();
    // a segunda instantânea não tem cascata; o feitiço ainda teria
    tg.cast('Think Twice');
    expect(tg.state.zones.stack).toHaveLength(1);
    expect(tg.state.delayedTriggers).toHaveLength(1);
  });
});
