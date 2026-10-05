import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

describe('Muddle, the Ever-Changing', () => {
  it('vira cópia com miríade; cada ficha ataca um oponente diferente do defensor e é exilada no fim do combate', () => {
    const tg = setup({
      players: 4, battlefield: [[{ name: 'Muddle, the Ever-Changing', ready: true }, 'Elvish Mystic', 'Swamp', 'Swamp'], [], [], []], hand: [["Night's Whisper"], [], [], []],
      library: [['Island', 'Island', 'Island'], ['Island'], ['Island'], ['Island']],
    });
    tg.choose('não lendária', ['Elvish Mystic']);
    tg.cast("Night's Whisper").resolveAll();
    const m = tg.state.zones.battlefield.find((id) => tg.state.objects[id].def === 'Muddle, the Ever-Changing')!;
    expect(chars(tg.g, m).name).toBe('Elvish Mystic');
    tg.yes('Miríade').yes('Miríade');
    tg.attack([[m, 1]]).passTo('declareAttackers').resolveAll();
    const fichas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].isToken);
    expect(fichas.length).toBe(2);
    expect(tg.state.combat!.attackers.map((a) => a.target.id).sort()).toEqual([1, 2, 3]);
    tg.passTo('main2');
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].isToken).length).toBe(0);
  });
  it('com um só oponente, nenhuma ficha', () => {
    const tg = setup({ battlefield: [[{ name: 'Muddle, the Ever-Changing', ready: true }, 'Wall of Omens', 'Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Island', 'Island', 'Island'], ['Island']] });
    tg.choose('não lendária', ['Wall of Omens']);
    tg.cast("Night's Whisper").resolveAll();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].isToken).length).toBe(0);
  });
});
