import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

const N = 'Young Pyromancer';

describe(N, () => {
  it('conjurando uma instantânea, o gatilho resolve antes dela e cria o Elemental', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Opt'], []], library: [['Plains', 'Swamp'], []] });
    tg.cast('Opt').resolve();
    const el = tg.bf('Elemental');
    expect(chars(tg.g, el).colors).toEqual(['R']);
    expect(tg.pt(el)).toEqual([1, 1]);
    // o Opt ainda está na pilha
    expect(tg.find('Opt', 'stack')).not.toBeNull();
  });

  it('feitiço também dispara; o de oponente não', () => {
    const tg = setup({ battlefield: [[N, 'Island'], ['Island']], hand: [['Serum Visions'], ['Opt']], library: [['Plains', 'Swamp', 'Forest'], ['Plains']] });
    tg.cast('Serum Visions').resolveAll();
    expect(tg.all('Elemental')).toHaveLength(1);
    tg.pass();
    tg.cast('Opt');
    expect(tg.state.zones.stack).toHaveLength(1);
  });
});
