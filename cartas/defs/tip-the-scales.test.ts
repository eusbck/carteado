import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Tip the Scales', () => {
  it('o -X/-X vem de um gatilho reflexivo que vai para a pilha depois', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ['Indomitable Ancients', 'Arboreal Grazer']], hand: [['Tip the Scales'], []] });
    tg.cast('Tip the Scales').resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.state.zones.stack.length).toBe(1); // reflexivo na pilha, dá para responder
    expect(tg.find('Arboreal Grazer')).not.toBeNull();
    tg.resolve();
    expect(tg.find('Arboreal Grazer')).toBeNull(); // 0/3 com -4/-4
  });

  it('X é a resistência da criatura sacrificada como estava no campo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', { name: 'Wall of Omens', counters: { '+1/+1': 2 } }], ['Indomitable Ancients']], hand: [['Tip the Scales'], []] });
    tg.cast('Tip the Scales').resolve().resolve();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([-4, 4]); // X = 6
  });
});
