import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "River's Rebuke";

describe(N, () => {
  it('devolve todos os permanentes não terrenos do jogador alvo para a mão do dono', () => {
    const tg = setup({ players: 3, battlefield: [[...Array(6).fill('Island'), 'Elvish Mystic'], ['Indomitable Ancients', 'Sol Ring', 'Forest'], ['Wall of Omens']], hand: [[N], [], []] });
    tg.choose('jogador alvo', ['Bruno']).cast(N).resolveAll();
    expect(tg.names(1, 'hand').sort()).toEqual(['Indomitable Ancients', 'Sol Ring']);
    // os terrenos dele e os permanentes dos outros ficam
    expect(tg.names(1, 'battlefield')).toEqual(['Forest']);
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });
});
