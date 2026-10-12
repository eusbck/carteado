import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Canoptek Scarab Swarm';

describe(N, () => {
  it('exila o cemitério do jogador alvo e cria um Insect para cada carta de artefato ou de terreno exilada', () => {
    const tg = setup({ battlefield: [Array(4).fill('Forest'), []], hand: [[N], []], graveyard: [[], ['Sol Ring', 'Island', 'Elvish Mystic']] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('jogador alvo') ? { kind: 'select', ids: [d.items[1].id] } : null));
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual([]);
    expect(tg.names(1, 'exile')).toHaveLength(3);
    expect(tg.all('Insect')).toHaveLength(2);
    expect(tg.pt(tg.all('Insect')[0])).toEqual([1, 1]);
    expect(hasKw(tg.g, tg.all('Insect')[0], 'flying')).toBe(true);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
  });
});