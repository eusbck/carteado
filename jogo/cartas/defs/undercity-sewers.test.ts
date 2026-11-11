import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Undercity Sewers';

describe(NOME, () => {
  it('entra virado e vigia 1', () => {
    const tg = setup({ hand: [[NOME], []], library: [['Zetalpa, Primal Dawn', 'Island'], []] });
    tg.script.push((d) => (d.kind === 'select' && d.items.some((i) => i.label.includes('Zetalpa')) ? { kind: 'select', ids: d.items.filter((i) => /cemit/i.test(i.label) || /Zetalpa/.test(i.label)).slice(0, d.max).map((i) => i.id) } : null));
    tg.play(NOME).resolveAll();
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
});
