import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/api.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Vanguard Seraph';
const vigiar = (tg: ReturnType<typeof setup>) => tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'graveyard'])), order: d.items.map((i) => i.id) } : null));

describe(N, () => {
  it('só o primeiro ganho de vida do turno, de qualquer tamanho', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Plains', 'Island', 'Swamp'], []] });
    vigiar(tg);
    vigiar(tg);
    gainLife(tg.g, 0, 3, tg.bf(N));
    tg.refresh();
    tg.resolveAll();
    gainLife(tg.g, 0, 1, tg.bf(N));
    tg.refresh();
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Plains']);
  });

  it('se você já ganhou vida no turno antes de ela entrar, não dispara nesse turno', () => {
    const tg = setup({ battlefield: [['Sol Ring'], []], library: [['Plains', 'Island'], []] });
    gainLife(tg.g, 0, 2, tg.bf('Sol Ring'));
    enterCard(tg, N, 0);
    vigiar(tg);
    gainLife(tg.g, 0, 2, tg.bf(N));
    tg.refresh();
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });
});
