import { describe, expect, it } from 'vitest';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Electric Seaweed';

describe(N, () => {
  it('no turno em que entra, cada outra criatura que morre faz 1 de dano a cada criatura que não é Wall; {T}: 1 de dano', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Mountain'), 'Silver Myr'], ['Elvish Mystic', 'Serra Angel']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([0, 4]);
    removeCard(tg, tg.bf('Silver Myr'));
    tg.resolveAll();
    // o Elvish Mystic morre com o primeiro dano e dispara de novo
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.state.objects[tg.bf('Serra Angel')].damage).toBe(2);
    expect(tg.state.objects[tg.bf(N)].damage).toBe(0);
    tg.choose('qualquer alvo', ['Serra Angel']).activate(N).resolveAll();
    expect(tg.state.objects[tg.bf('Serra Angel')].damage).toBe(3);
  });
});