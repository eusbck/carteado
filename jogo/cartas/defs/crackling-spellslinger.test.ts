import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { putOntoBattlefield } from '../../motor/actions.ts';

const N = 'Crackling Spellslinger';
const terrenos = ['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Island', 'Island', 'Island', 'Island', 'Island', 'Island'];

describe(N, () => {
  it('conjurada, a próxima instantânea do turno tem tempestade e as cópias não contam como mágicas conjuradas', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [['Opt', N, 'Opt', 'Opt'], []], library: [Array(10).fill('Plains'), []] });
    tg.cast('Opt').resolveAll();
    tg.cast(N).resolveAll();
    expect(tg.state.delayedTriggers).toHaveLength(1);
    const mao = tg.names(0, 'hand').length;
    tg.cast('Opt');
    // a tempestade dispara ao conjurar
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    // duas mágicas antes (Opt e a Spellslinger): duas cópias
    expect(tg.state.zones.stack.filter((id) => tg.state.objects[id].isCopy)).toHaveLength(2);
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(mao - 1 + 3);
    expect(tg.state.turnStats[0].spellsCast).toBe(3);
    // a seguinte não tem mais tempestade
    tg.cast('Opt');
    expect(tg.state.zones.stack).toHaveLength(1);
  });

  it('posta no campo sem ser conjurada, não dá tempestade', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [[N, 'Opt'], []], library: [Array(5).fill('Plains'), []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find(N, 'hand', 0)!, controller: 0 }], 'effect'));
    tg.resolveAll();
    expect(tg.state.delayedTriggers).toHaveLength(0);
    tg.cast('Opt');
    expect(tg.state.zones.stack).toHaveLength(1);
  });

  it('lampejo: pode ser conjurada no turno do oponente', () => {
    const tg = setup({ active: 1, battlefield: [terrenos, []], hand: [[N], []] });
    tg.pass();
    tg.cast(N).resolveAll();
    expect(tg.find(N)).not.toBeNull();
  });
});
