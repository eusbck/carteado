import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/actions.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Lita, Little Orphan Amphibian';

describe(N, () => {
  it('cada disparo no turno escolhe um modo diferente; no quarto, nada acontece', () => {
    const tg = setup({ battlefield: [[N], []], library: [[], []] });
    const vistos: string[][] = [];
    const pedidos = ['Coloque um marcador +1/+1 em Lita', 'Crie uma ficha Food', 'Vidência 1'];
    for (let n = 0; n < 4; n++) tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Lita')) return null;
      vistos.push(d.items.map((i) => i.label));
      const quero = pedidos[vistos.length - 1];
      return { kind: 'select', ids: [d.items.find((i) => i.label === quero)!.id] };
    });
    for (let i = 0; i < 4; i++) { runEffect(tg, createTokens(tg.g, 0, 'Soldier', 1)); tg.resolveAll(); }
    expect(vistos.map((v) => v.length)).toEqual([3, 2, 1]);
    expect(tg.pt(tg.bf(N))).toEqual([3, 2]);
    expect(tg.all('Food')).toHaveLength(1);
  });
});