import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Shellshock';

describe(N, () => {
  it('X de dano em até uma criatura de cada oponente; uma ficha Mutagen para cada criatura que recebeu dano', () => {
    const tg = setup({ players: 3, battlefield: [Array(4).fill('Mountain'), ['Elvish Mystic', 'Silver Myr'], ['Serra Angel']], hand: [[N], [], []] });
    tg.number('X', 3).choose('até uma por oponente', ['Elvish Mystic', 'Serra Angel']).cast(N).resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Silver Myr')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Serra Angel')].damage).toBe(3);
    expect(tg.all('Mutagen')).toHaveLength(2);
  });
});