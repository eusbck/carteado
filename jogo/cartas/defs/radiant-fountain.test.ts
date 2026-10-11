import { describe, expect, it } from 'vitest';
import { alternativasDeMana, jogarTerreno } from '../../testes/padroes.ts';

const NOME = 'Radiant Fountain';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('quando entra, você ganha 2 de vida (gatilho na pilha)', () => {
    const tg = jogarTerreno(NOME);
    expect(tg.state.zones.stack.length).toBe(1);
    expect(tg.life(0)).toBe(40);
    tg.resolve();
    expect(tg.life(0)).toBe(42);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(false);
  });
});
