import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Ukkima, Stalking Shadow';

describe(N, () => {
  it('usa a força como existia por último no campo', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 3 } }], []] });
    tg.choose('jogador alvo', ['Bruno']);
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    expect(tg.life(1)).toBe(35);
    expect(tg.life(0)).toBe(45);
  });

  it('não pode ser bloqueada; ao entrar, pode buscar Cazur', () => {
    const tg = setup({ battlefield: [['Island', 'Swamp', 'Island'], ['Indomitable Ancients']], hand: [[N], []], library: [['Cazur, Ruthless Stalker', 'Forest'], []] });
    tg.choose('jogador alvo', ['Ana']).yes('Parceiro com', true).choose('Escolha Cazur', ['Cazur, Ruthless Stalker']);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Cazur, Ruthless Stalker']);
    expect(hasKw(tg.g, tg.bf(N), 'unblockable')).toBe(true);
  });
});
