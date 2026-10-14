import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Scavenging Ooze';

describe(N, () => {
  it('exila uma carta de criatura de um cemitério: marcador +1/+1 e 1 de vida; outra carta, só exila', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []], graveyard: [[], ['Indomitable Ancients', 'Island']] });
    tg.choose('carta alvo num cemitério', ['Indomitable Ancients']).activate(N).resolve();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.life(0)).toBe(41);
    tg.choose('carta alvo num cemitério', ['Island']).activate(N).resolve();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.life(0)).toBe(41);
    expect(tg.names(1, 'exile').sort()).toEqual(['Indomitable Ancients', 'Island']);
  });

  it('duas ativações no mesmo alvo: só a primeira faz efeito', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []], graveyard: [[], ['Indomitable Ancients']] });
    tg.choose('carta alvo num cemitério', ['Indomitable Ancients']).activate(N);
    tg.choose('carta alvo num cemitério', ['Indomitable Ancients']).activate(N);
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.life(0)).toBe(41);
  });
});
