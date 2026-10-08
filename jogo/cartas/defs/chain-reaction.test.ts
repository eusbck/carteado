import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Chain Reaction', () => {
  it('X é o número de criaturas na resolução', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Sol Ring', 'Wall of Omens'], ['Indomitable Ancients', 'Arboreal Grazer']], hand: [['Chain Reaction'], []] });
    tg.cast('Chain Reaction').resolve();
    expect(tg.find('Arboreal Grazer')).toBeNull(); // 3 de dano em 0/3
    expect(tg.find('Wall of Omens')).not.toBeNull(); // 0/4
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
  });
});
