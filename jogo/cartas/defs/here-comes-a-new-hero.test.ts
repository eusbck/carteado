import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Here Comes a New Hero!';

describe(N, () => {
  it('o jogador alvo compra X cartas; cria uma cópia de até uma criatura alvo com valor de mana X ou menos', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Island'), 'Silver Myr', 'Serra Angel'], []], hand: [[N], []], library: [['Island', 'Island', 'Island'], ['Island', 'Island', 'Island']] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('jogador alvo') ? { kind: 'select', ids: [d.items[0].id] } : null));
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('valor de mana X ou menos')) return null;
      // X = 2: o Serra Angel (valor 5) não é alvo
      expect(d.items.map((i) => i.label)).toEqual(['Silver Myr']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.number('X', 2).cast(N).resolveAll();
    expect(tg.names(0, 'hand').length + tg.names(1, 'hand').length).toBe(2);
    expect(tg.all('Silver Myr')).toHaveLength(2);
  });
});