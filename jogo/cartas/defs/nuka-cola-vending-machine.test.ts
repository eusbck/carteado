import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Nuka-Cola Vending Machine';

describe(N, () => {
  it('sacrificando a Food para ganhar vida, cria um Treasure virado', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Forest', 'Forest'], []] });
    tg.activate(N, 'Food').resolve();
    tg.activate('Food', 'vida').resolveAll();
    expect(tg.life(0)).toBe(43);
    const tr = tg.bf('Treasure');
    expect(tg.state.objects[tr].tapped).toBe(true);
  });

  it('a Food sacrificada por outro motivo também conta', () => {
    // o custo de forragear da Camellia sacrifica a Food
    const tg2 = setup({ battlefield: [[N, 'Camellia, the Seedmiser', { name: 'Food', token: true }, 'Swamp', 'Swamp'], []] });
    tg2.activate('Camellia, the Seedmiser', 'Forragear').resolveAll();
    expect(tg2.find('Food')).toBeNull();
    expect(tg2.bf('Treasure')).toBeTruthy();
  });
});
