import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw, putOntoBattlefield } from '../../motor/api.ts';

const Z = 'Zurgo and Ojutai';

describe(Z, () => {
  it('tem resistência a magia enquanto tiver entrado neste turno', () => {
    const tg = setup({ battlefield: [[Z], []], hand: [[Z], []] });
    expect(hasKw(tg.g, tg.bf(Z), 'hexproof')).toBe(false);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find(Z, 'hand', 0)!, controller: 0 }], 'effect'));
    const novo = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === Z).at(-1)!;
    expect(hasKw(tg.g, novo, 'hexproof')).toBe(true);
  });

  it('um gatilho por jogador que tomou dano de combate dos seus Dragons', () => {
    const tg = setup({ battlefield: [[Z, 'Dragon Whelp', 'Elvish Mystic'], []], library: [['Island', 'Plains', 'Swamp', 'Forest'], ['Island']] });
    tg.choose('vai para a sua mão', ['Plains']).choose('próxima carta a ir para o fundo', ['Island']);
    tg.choose('devolver um desses Dragons', ['Dragon Whelp']);
    tg.attack([[Z, 1], ['Dragon Whelp', 1], ['Elvish Mystic', 1]]).passUntil((x) => x.state.turn.step === 'combatDamage' && x.state.zones.stack.length > 0);
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Dragon Whelp', 'Plains']);
    // o resto no fundo, na ordem escolhida: Island primeiro, depois Swamp
    expect(tg.names(0, 'library')).toEqual(['Forest', 'Island', 'Swamp']);
  });
});
