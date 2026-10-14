import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const N = "Witch's Clinic";

describe(N, () => {
  it('{T}: {C}; {2}, {T}: só um comandante pode ser o alvo, e ganha vínculo com a vida', () => {
    expect(alternativasDeMana(N)).toEqual(['C']);
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Indomitable Ancients'], [{ name: 'Ripjaw Raptor', commander: true }]] });
    let alvos: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('comandante alvo') ? (alvos = d.items.filter((i) => !i.disabled).map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Ripjaw Raptor')!.id] }) : null));
    tg.activate(N, 'vínculo').resolve();
    expect(alvos).toEqual(['Ripjaw Raptor']);
    expect(hasKw(tg.g, tg.bf('Ripjaw Raptor'), 'lifelink')).toBe(true);
  });
});
