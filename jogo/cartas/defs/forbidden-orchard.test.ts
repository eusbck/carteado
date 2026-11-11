import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Forbidden Orchard', () => {
  it('CR 605: uma mana de qualquer cor', () => expect(alternativasDeMana('Forbidden Orchard')).toEqual(['B', 'G', 'R', 'U', 'W']));
  it('virado para mana, o oponente alvo cria um Spirit incolor 1/1 (pela pilha)', () => {
    const tg = setup({ battlefield: [['Forbidden Orchard'], []], hand: [['Elvish Mystic'], []] });
    tg.cast('Elvish Mystic');
    // a mágica e o gatilho: o gatilho fica por cima e resolve primeiro
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual(['Spirit']);
    expect(tg.find('Elvish Mystic', 'battlefield', 0)).not.toBeNull();
  });
});
