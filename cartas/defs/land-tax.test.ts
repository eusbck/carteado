import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const naManutencao = (tg: ReturnType<typeof setup>) => tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');

describe('Land Tax', () => {
  it('se um oponente tem mais terrenos, busca até três básicos para a mão', () => {
    const tg = setup({
      step: 'end', active: 1,
      battlefield: [['Land Tax', 'Plains'], ['Forest', 'Forest']], library: [['Plains', 'Island', 'Wall of Omens', 'Swamp', 'Mountain'], ['Island']],
    });
    tg.yes('Land Tax', true).choose('três cartas de terreno básico', ['Plains', 'Island', 'Swamp']);
    naManutencao(tg).resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', 'Plains', 'Swamp']);
  });
  it('CR 603.4: não dispara se nenhum oponente tem mais terrenos', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Land Tax', 'Plains', 'Plains'], ['Forest', 'Forest']], library: [['Plains'], ['Island']] });
    naManutencao(tg);
    expect(tg.state.zones.stack.length).toBe(0);
  });
  it('embaralha mesmo sem pegar nada', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Land Tax'], ['Forest']], library: [['Wall of Omens', 'Sol Ring'], ['Island']] });
    tg.yes('Land Tax', true);
    naManutencao(tg);
    const antes = JSON.stringify(tg.state.rng);
    tg.resolve();
    expect(JSON.stringify(tg.state.rng)).not.toBe(antes); // o embaralhamento consome o gerador
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
