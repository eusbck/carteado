import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Scriv, the Obligator', () => {
  it('ao entrar, prende um Contract à criatura de um oponente; atacando um oponente de Ana, ela recebe +2/+0', () => {
    const tg = setup({
      players: 3, battlefield: [['Plains', 'Plains', 'Swamp', 'Swamp'], ['Gau, Feral Youth'], []], hand: [['Scriv, the Obligator'], [], []],
      library: [['Island'], ['Island'], ['Island']],
    });
    tg.choose('oponente controla', ['Gau, Feral Youth']);
    tg.cast('Scriv, the Obligator').resolve().resolveAll();
    const k = tg.bf('Contract');
    const gau = tg.bf('Gau, Feral Youth');
    expect(tg.state.objects[k].attachedTo).toBe(gau);
    expect(tg.state.objects[k].controller).toBe(0);
    // Bruno ataca Carla (oponente de Ana): +2/+0
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'main1');
    tg.script.push((d) => (d.kind === 'attackers' ? { kind: 'attackers', attacks: [[gau, { kind: 'player', id: 2 }]] } : null));
    tg.passTo('declareAttackers').resolveAll();
    expect(tg.pt(gau)).toEqual([5, 3]); // 3/3 pela fúria + 2/0
    expect(tg.life(1)).toBe(40);
  });
  it('atacando Ana (não é oponente dela mesma), o controlador da criatura perde 2', () => {
    const tg = setup({ active: 1, battlefield: [[], ['Gau, Feral Youth', { name: 'Contract', token: true, attachTo: 'Gau, Feral Youth' }]], library: [['Island'], ['Island']] });
    // o Contract é de Ana
    const k = tg.bf('Contract');
    tg.state.objects[k].controller = 0;
    tg.state.objects[k].owner = 0;
    const gau = tg.bf('Gau, Feral Youth');
    tg.refresh();
    tg.script.push((d) => (d.kind === 'attackers' ? { kind: 'attackers', attacks: [[gau, { kind: 'player', id: 0 }]] } : null));
    tg.passTo('declareAttackers').resolveAll();
    expect(tg.life(1)).toBe(38);
    expect(tg.pt(gau)).toEqual([3, 3]); // só a fúria
  });
});
