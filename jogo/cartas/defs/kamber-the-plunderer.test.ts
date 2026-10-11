import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Kamber, the Plunderer';

describe(N, () => {
  it('parceiro com Laurine: ao entrar, o jogador alvo pode buscar Laurine no próprio grimório', () => {
    const tg = setup({ battlefield: [[], []], library: [['Swamp', 'Laurine, the Diversion', 'Swamp'], []] });
    tg.choose('jogador alvo', ['Ana']).yes('Parceiro com', true).choose('Escolha Laurine', ['Laurine, the Diversion']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([3, 4]);
    expect(hasKw(tg.g, id, 'lifelink')).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Laurine, the Diversion']);
    expect(tg.names(0, 'library')).toHaveLength(2);
  });

  it('quando morre uma criatura de um oponente, você ganha 1 de vida e cria um Blood; a sua não conta', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], ['Elvish Mystic']] });
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic', 1)]));
    tg.resolveAll();
    expect(tg.life(0)).toBe(41);
    expect(tg.all('Blood')).toHaveLength(1);
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic', 0)]));
    tg.resolveAll();
    expect(tg.all('Blood')).toHaveLength(1);
  });
});
