import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Cazur, Ruthless Stalker';
const U = 'Ukkima, Stalking Shadow';

describe(N, () => {
  it('ao entrar, o jogador alvo pode pôr Ukkima do grimório dele na mão', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest'], []], hand: [[N], []], library: [['Island', U, 'Swamp'], []] });
    tg.choose('jogador alvo', ['Ana']).yes('Parceiro com', true).choose('Escolha Ukkima', [U]);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual([U]);
  });

  it('uma criatura sua que causa dano de combate a um jogador recebe um marcador +1/+1', () => {
    const tg = setup({ battlefield: [[N, 'Slither Blade'], ['Indomitable Ancients']] });
    tg.block([['Indomitable Ancients', N]]);
    tg.attack([[N, 1], ['Slither Blade', 1]]).passTo('main2', 0);
    expect(tg.state.objects[tg.bf('Slither Blade')].counters['+1/+1']).toBe(1);
    // Cazur foi bloqueado: não causou dano a jogador
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1'] ?? 0).toBe(0);
  });
});
