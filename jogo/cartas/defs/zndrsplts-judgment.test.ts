import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Zndrsplt's Judgment";
const ilhas = Array(5).fill('Island');
const AMIGO = 'Amigo (cria uma ficha cópia de uma criatura dele)';
const INIMIGO = 'Inimigo (devolve uma criatura dele para a mão do dono)';

describe(N, () => {
  it('cada amigo cria uma ficha cópia de uma criatura dele; cada inimigo devolve uma criatura dele para a mão', () => {
    const tg = setup({
      players: 3, hand: [[N], [], []],
      battlefield: [[...ilhas, 'Indomitable Ancients'], ['Elvish Mystic', 'Wall of Omens'], ['Silver Myr']],
    });
    tg.choose('Ana é amigo', [AMIGO]).choose('Bruno é amigo', [INIMIGO]).choose('Carla é amigo', [AMIGO]);
    // Bruno, inimigo, escolhe qual das duas devolver
    tg.choose('devolver para a mão do dono', ['Wall of Omens']);
    tg.cast(N).resolveAll();
    expect(tg.all('Indomitable Ancients')).toHaveLength(2);
    expect(tg.all('Silver Myr')).toHaveLength(2);
    // a ficha de Carla é dela
    expect(tg.all('Silver Myr').every((id) => tg.state.objects[id].controller === 2)).toBe(true);
    expect(tg.names(1, 'hand')).toEqual(['Wall of Omens']);
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });

  it('você pode se declarar inimigo', () => {
    const tg = setup({ battlefield: [[...ilhas, 'Indomitable Ancients'], ['Elvish Mystic']], hand: [[N], []] });
    tg.choose('Ana é amigo', [INIMIGO]).choose('Bruno é amigo', [INIMIGO]);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Indomitable Ancients']);
    expect(tg.names(1, 'hand')).toEqual(['Elvish Mystic']);
  });

  it('jogador sem criaturas não faz nada, seja amigo ou inimigo', () => {
    const tg = setup({ players: 3, battlefield: [ilhas, [], []], hand: [[N], [], []] });
    tg.choose('Ana é amigo', [AMIGO]).choose('Bruno é amigo', [INIMIGO]).choose('Carla é amigo', [AMIGO]);
    tg.cast(N).resolveAll();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].isToken)).toHaveLength(0);
  });
});
