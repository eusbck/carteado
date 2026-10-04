import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Feed the Swarm', () => {
  it('perde vida igual ao valor de mana do permanente', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Wall of Omens']], hand: [['Feed the Swarm'], []] });
    tg.choose('oponente controla', ['Wall of Omens']).cast('Feed the Swarm').resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.life(0)).toBe(38);
  });
  it('alvo indestrutível não é destruído, mas você perde a vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Zetalpa, Primal Dawn']], hand: [['Feed the Swarm'], []] });
    tg.choose('oponente controla', ['Zetalpa, Primal Dawn']).cast('Feed the Swarm').resolve();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.life(0)).toBe(32);
  });
});
