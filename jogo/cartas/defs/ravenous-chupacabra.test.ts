import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Ravenous Chupacabra', () => {
  it('ao entrar, destrói a criatura alvo que um oponente controla', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Sol Ring', 'Wall of Omens'], ['Indomitable Ancients']], hand: [['Ravenous Chupacabra'], []] });
    tg.choose('oponente controla', ['Indomitable Ancients']).cast('Ravenous Chupacabra').resolve().resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
  it('CR 603.3d: sem criatura de oponente, o gatilho sai da pilha sem efeito', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Sol Ring', 'Wall of Omens'], []], hand: [['Ravenous Chupacabra'], []] });
    tg.cast('Ravenous Chupacabra').resolve();
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
});
