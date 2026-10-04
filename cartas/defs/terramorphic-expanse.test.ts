import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = "Terramorphic Expanse";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual([]));
  it('busca um terreno básico para o campo, virado', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Plains', 'Sol Ring'], []] });
    tg.choose('terreno básico', ['Plains']).activate(NOME, 'Sacrifique').resolve();
    expect(tg.find(NOME)).toBeNull();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
  });
});
