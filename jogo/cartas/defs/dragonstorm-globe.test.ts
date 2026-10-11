import { describe, expect, it } from 'vitest';
import { activateMana, enterCard, fixture } from '../../testes/artefatos.ts';

const N = 'Dragonstorm Globe';

describe(N, () => {
  it('cada Dragon que você controla entra com um marcador +1/+1 adicional; os outros não', () => {
    const tg = fixture({ battlefield: [[N, 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Rapacious Dragon'], []] });
    tg.cast('Rapacious Dragon').resolveAll();
    const dragao = tg.bf('Rapacious Dragon');
    expect(tg.state.objects[dragao].counters['+1/+1']).toBe(1);
    expect(tg.pt(dragao)).toEqual([4, 4]);
    // entrando por efeito também vale; quem não é Dragon e o Dragon de outro jogador não recebem
    const outro = enterCard(tg, 'Goldspan Dragon', 0)!;
    expect(tg.state.objects[outro].counters['+1/+1']).toBe(1);
    const elfo = enterCard(tg, 'Elvish Mystic', 0)!;
    expect(tg.state.objects[elfo].counters['+1/+1'] ?? 0).toBe(0);
    const dele = enterCard(tg, 'Goldspan Dragon', 1)!;
    expect(tg.state.objects[dele].counters['+1/+1'] ?? 0).toBe(0);
  });

  it('{T}: adiciona uma mana de qualquer cor', () => {
    const tg = fixture({ battlefield: [[N], []] });
    activateMana(tg, N, 'G');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['G']);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});
