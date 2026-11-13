import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Ezuri, Renegade Leader';

describe(N, () => {
  it('regenera outro Elfo, mas não pode mirar ele mesmo; o segundo inclui o próprio Ezuri', () => {
    const tg = setup({ battlefield: [[N, 'Llanowar Elves', 'Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Forest'], []] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind === 'select' && d.prompt.includes('outro Elfo alvo')) { alvos = d.items.map((i) => i.label); return { kind: 'select', ids: [d.items[0].id] }; }
      return null;
    });
    tg.activate(N, 'Regenere').resolve();
    expect(alvos.some((l) => l.includes('Ezuri'))).toBe(false);
    runEffect(tg, destroy(tg.g, [tg.bf('Llanowar Elves')]));
    expect(tg.find('Llanowar Elves')).not.toBeNull();
    tg.activate(N, '+3/+3').resolve();
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
    expect(tg.pt(tg.bf('Llanowar Elves'))).toEqual([4, 4]);
    expect(hasKw(tg.g, tg.bf('Llanowar Elves'), 'trample')).toBe(true);
  });
  it('só os Elfos que você controla na resolução recebem +3/+3 e atropelar', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest', 'Forest', 'Forest'], ['Elvish Mystic']] });
    tg.activate(N, '+3/+3').resolve();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
  });
});
