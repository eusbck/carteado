import { describe, expect, it } from 'vitest';
import { alternativasDeMana } from '../../testes/padroes.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Bugenhagen, Wise Elder';

describe(N, () => {
  it('CR 605: {T}: uma mana de qualquer cor', () => expect(alternativasDeMana(N)).toEqual(['B', 'G', 'R', 'U', 'W']));

  it('CR 603.4 — sem criatura com força 7 ou mais, não dispara; com ela, compra uma carta', () => {
    const sem = setup({ battlefield: [[], [N, 'Zetalpa, Primal Dawn']], step: 'end' });
    sem.passUntil((t) => t.state.turn.step === 'upkeep' && t.state.turn.active === 1);
    expect(sem.state.zones.stack.length).toBe(0);
    const com = setup({ battlefield: [[], [N, 'Jumbo Cactuar', { name: 'Loxodon Warhammer', attachTo: 'Jumbo Cactuar' }, { name: 'Swordsman\'s Steel', attachTo: 'Jumbo Cactuar' }]], step: 'end' });
    // Jumbo Cactuar 1/7 + 3 do martelo + 4 do aço (dois Equipamentos) = 8
    com.passUntil((t) => t.state.turn.step === 'upkeep' && t.state.zones.stack.length > 0);
    const antes = com.names(1, 'hand').length;
    com.resolve();
    expect(com.names(1, 'hand').length).toBe(antes + 1);
  });
});
