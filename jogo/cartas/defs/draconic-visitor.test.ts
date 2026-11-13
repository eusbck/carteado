import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens, hasKw } from '../../motor/api.ts';

const D = 'Draconic Visitor';

describe(D, () => {
  it('os Tesouros que você criaria viram Dragons 5/5 com voar, virados se fossem virados; outras fichas, não', () => {
    const tg = setup({ battlefield: [[D], []] });
    const ids = tg.run(createTokens(tg.g, 0, 'Treasure', 2, { tapped: true }));
    expect(ids.length).toBe(2);
    for (const id of ids) {
      expect(tg.state.objects[id].def).toBe('Dragon 5/5');
      expect(tg.pt(id)).toEqual([5, 5]);
      expect(hasKw(tg.g, id, 'flying')).toBe(true);
      expect(tg.state.objects[id].tapped).toBe(true);
    }
    const [s] = tg.run(createTokens(tg.g, 0, 'Saproling', 1));
    expect(tg.state.objects[s].def).toBe('Saproling');
    // o oponente cria Tesouro normalmente
    const [t] = tg.run(createTokens(tg.g, 1, 'Treasure', 1));
    expect(tg.state.objects[t].def).toBe('Treasure');
  });
});
