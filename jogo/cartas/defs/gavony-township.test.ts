import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Gavony Township';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('{2}{G}{W}, {T}: um marcador +1/+1 em cada criatura sua (não nas dos oponentes)', () => {
    const tg = setup({
      battlefield: [[NOME, 'Forest', 'Plains', 'Sol Ring', 'Indomitable Ancients', 'Wall of Omens'], ['Elvish Mystic']],
    });
    tg.activate(NOME, 'marcador').resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters['+1/+1']).toBe(1);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 5]);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters['+1/+1'] ?? 0).toBe(0);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
});
