// CR 800.4a: quem sai da partida não fica com permanentes, nem como controlador de base de algo que outro controla.
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { controllerOf, gainControl } from '../motor/api.ts';
import { leaveGame } from '../motor/sba.ts';

describe('sair da partida e controle', () => {
  it('permanente posto no campo por quem saiu, mas controlado por outro, fica com o outro; sem o efeito, volta ao dono', () => {
    const tg = setup({
      players: 3, active: 1, battlefield: [[], [...Array(9).fill('Swamp')], []], hand: [[], ['Rise of the Dark Realms'], []],
      graveyard: [[], [], ['Wall of Omens']], library: [['Island'], ['Island'], ['Island']],
    });
    tg.cast('Rise of the Dark Realms').resolve();
    const w = tg.bf('Wall of Omens');
    expect(controllerOf(tg.g, w)).toBe(1);
    gainControl(tg.g, w, 0, { kind: 'permanent' }, w);
    leaveGame(tg.g, 1);
    expect(tg.state.zones.battlefield.includes(w)).toBe(true);
    expect(controllerOf(tg.g, w)).toBe(0);
    expect(tg.state.objects[w].controller).toBe(2);
    // se o efeito de controle acabar, a Wall volta para a dona, não para quem saiu
    tg.state.effects = tg.state.effects.filter((e) => !e.mods.some((m) => m.k === 'control'));
    tg.g.bump(); // as características ficam em cache até o estado mudar
    expect(controllerOf(tg.g, w)).toBe(2);
  });
});
