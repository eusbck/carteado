import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { runEffect, fixture as setup } from '../../testes/artefatos.ts';

const N = "Myr Retriever";
describe(N, () => {
  it("morte simultânea permite devolver o outro artefato, mas nunca a própria carta", () => {

    const tg = setup({ battlefield: [[N, 'Ichor Wellspring'], []] }); let offered: string[] = [];
    tg.script.push(d => { if (d.kind === 'select' && d.prompt.includes('outra carta de artefato')) offered = d.items.map(i => i.label); return null; });
    runEffect(tg, destroy(tg.g, [tg.bf(N), tg.bf('Ichor Wellspring')])); tg.settle(); tg.resolveAll();
    expect(offered).not.toContain(N); expect(tg.names(0, 'hand')).toContain('Ichor Wellspring'); expect(tg.find(N, 'graveyard')).not.toBeNull();
  });
});
