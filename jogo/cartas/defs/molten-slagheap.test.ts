import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Molten Slagheap';

describe(N, () => {
  it('{T}: {C}; {1}, {T}: põe um marcador de armazenamento', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []] });
    tg.activate(N, 'Coloque um marcador').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.storage).toBe(1);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    const outro = setup({ battlefield: [[N], []] });
    activateMana(outro, N, 'C');
    expect(outro.state.players[0].manaPool.map((u) => u.type)).toEqual(['C']);
  });

  it('{1}, remova X marcadores: X manas em qualquer combinação de preto e vermelho', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { storage: 3 } }, 'Island'], []] });
    tg.number('quantos marcadores', 3).number('quantas são pretas', 1);
    tg.activate(N, 'Remova X').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.storage ?? 0).toBe(0);
    expect(tg.state.players[0].manaPool.map((u) => u.type).sort()).toEqual(['B', 'R', 'R']);
    // sem marcadores, a habilidade não aparece
    expect(tg.actionIds().some((a) => a.startsWith('act:') && a.includes('Remova'))).toBe(false);
  });
});