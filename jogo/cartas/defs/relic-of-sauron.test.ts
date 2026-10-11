import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Relic of Sauron';

describe(N, () => {
  it('{T}: duas manas em qualquer combinação de azul, preto e vermelho', () => {
    for (const combo of ['UU', 'UB', 'BR', 'RR']) {
      const tg = setup({ battlefield: [[N], []] });
      const rotulo = combo.split('').map((x) => `{${x}}`).join('');
      tg.settle();
      const d = tg.pending;
      if (d?.kind !== 'priority') throw new Error('sem prioridade');
      const acao = d.actions.find((a) => a.kind === 'mana' && a.label.startsWith(N) && a.label.endsWith(rotulo))!;
      expect(acao, combo).toBeDefined();
      tg.answer({ kind: 'priority', action: acao.id });
      tg.settle();
      expect(tg.state.players[0].manaPool.map((u) => u.type).sort().join('')).toBe(combo.split('').sort().join(''));
    }
  });

  it('{3}, {T}: compra duas cartas e depois descarta uma', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], library: [['Sol Ring', 'Hex', 'Island'], []] });
    tg.choose('Descarte', ['Hex']);
    tg.activate(N, '{3}, {T}').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'graveyard')).toEqual(['Hex']);
  });
});
