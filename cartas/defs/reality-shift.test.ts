import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

describe('Reality Shift', () => {
  it('a manifestada é uma criatura 2/2 incolor sem nome; carta de criatura vira para cima pagando o custo de mana (ação especial); virar para cima não dispara "ao entrar"', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Gau, Feral Youth', 'Plains', 'Plains']], hand: [['Reality Shift'], []], library: [['Island'], ['Wall of Omens', 'Island']] });
    tg.choose('criatura alvo', ['Gau, Feral Youth']);
    tg.cast('Reality Shift').resolve();
    expect(tg.names(1, 'exile')).toEqual(['Gau, Feral Youth']);
    const m = tg.state.zones.battlefield.find((id) => tg.state.objects[id].faceDown)!;
    const c = chars(tg.g, m);
    expect([c.power, c.toughness, c.colors.length, c.name]).toEqual([2, 2, 0, '']);
    expect(c.types).toEqual(['Creature']);
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'main1');
    const vira = tg.actionIds().find((a) => a === `faceup:${m}`);
    expect(vira).toBeDefined();
    tg.answer({ kind: 'priority', action: vira! });
    tg.settle();
    expect(tg.state.objects[m].faceDown).toBe(false);
    expect(chars(tg.g, m).name).toBe('Wall of Omens');
    expect(tg.state.zones.stack.length).toBe(0); // sem "ao entrar" de Wall of Omens
    expect(tg.names(1, 'hand')).toEqual(['Island']); // só a compra do turno
  });
});
