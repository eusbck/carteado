import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Temporal Trespass';

describe(N, () => {
  it('delve paga só o genérico', () => {
    const tg = setup({
      battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []], graveyard: [Array(8).fill('Swamp'), []], library: [['Plains', 'Plains'], ['Plains', 'Plains']],
    });
    let maximo = -1;
    tg.script.push((d) => (d.kind === 'number' && d.prompt.includes('exilar') ? (maximo = d.max, { kind: 'number', value: 8 }) : null));
    const turno = tg.state.turn.number;
    tg.cast(N).resolve();
    expect(maximo).toBe(8);
    // a própria carta é exilada (junto das 8 do delve)
    expect(tg.names(0, 'exile').length).toBe(9);
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(tg.state.extraTurns).toHaveLength(1);
    tg.passUntil((t) => t.state.turn.number > turno);
    expect(tg.state.turn.active).toBe(0);
  });
});
