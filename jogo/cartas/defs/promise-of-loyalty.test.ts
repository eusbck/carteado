import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { removeCounters } from '../../motor/api.ts';

describe('Promise of Loyalty', () => {
  it('cada jogador, inclusive você, fica com uma criatura; ela não pode atacar você', () => {
    const tg = setup({
      players: 3, battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Wall of Omens', 'Elvish Mystic'], ['Gau, Feral Youth', 'Glissa Sunslayer'], ['Elvish Mystic']],
      hand: [['Promise of Loyalty'], [], []], library: [['Island'], ['Island'], ['Island']],
    });
    tg.choose('marcador de voto', ['Wall of Omens']).choose('marcador de voto', ['Gau, Feral Youth']);
    tg.cast('Promise of Loyalty').resolve();
    expect(tg.all('Elvish Mystic').length).toBe(1);
    expect(tg.find('Glissa Sunslayer')).toBeNull();
    const gau = tg.bf('Gau, Feral Youth');
    expect(tg.state.objects[gau].counters.vow).toBe(1);
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'main1');
    let alvos: number[] = [];
    tg.script.push((d) => (d.kind === 'attackers' ? (alvos = d.candidates.find((x) => x.obj === gau)!.targets.map((t) => t.id), { kind: 'attackers', attacks: [] }) : null));
    tg.passTo('main2');
    expect(alvos).toEqual([2]);
  });
  it('sem o marcador de voto, pode atacar', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains'], ['Gau, Feral Youth']], hand: [['Promise of Loyalty'], []], library: [['Island'], ['Island']] });
    tg.cast('Promise of Loyalty').resolve();
    const gau = tg.bf('Gau, Feral Youth');
    removeCounters(tg.g, { kind: 'obj', id: gau }, 'vow', 1);
    tg.refresh().passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'main1');
    let alvos: number[] = [];
    tg.script.push((d) => (d.kind === 'attackers' ? (alvos = d.candidates.find((x) => x.obj === gau)!.targets.map((t) => t.id), { kind: 'attackers', attacks: [] }) : null));
    tg.passTo('main2');
    expect(alvos).toEqual([0]);
  });
});
