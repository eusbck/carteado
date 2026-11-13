import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Stridehangar Automaton';

describe(N, () => {
  it('criando um Treasure, cria também um Thopter 1/1 voador, que recebe +1/+1', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 2));
    expect(tg.all('Treasure')).toHaveLength(2);
    expect(tg.all('Thopter')).toHaveLength(1);
    const th = tg.bf('Thopter');
    expect(tg.pt(th)).toEqual([2, 2]);
    expect(hasKw(tg.g, th, 'flying')).toBe(true);
  });

  it('uma ficha de criatura que não é artefato não traz o Thopter; as do oponente também não', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Cat 1/1 branco', 1));
    runEffect(tg, createTokens(tg.g, 1, 'Treasure', 1));
    expect(tg.all('Thopter')).toHaveLength(0);
  });

  it('com Mondrak, você escolhe a ordem: dobrar primeiro e depois o Thopter, ou o contrário', () => {
    const a = setup({ battlefield: [[N, 'Mondrak, Glory Dominus'], []] });
    a.script.push((d) => { const i = d.kind === 'select' ? d.items.find((x) => /Mondrak/.test(x.label)) : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    runEffect(a, createTokens(a.g, 0, 'Treasure', 1));
    expect([a.all('Treasure').length, a.all('Thopter').length]).toEqual([2, 1]);
    const b = setup({ battlefield: [[N, 'Mondrak, Glory Dominus'], []] });
    b.script.push((d) => { const i = d.kind === 'select' ? d.items.find((x) => /Stridehangar/.test(x.label)) : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    runEffect(b, createTokens(b.g, 0, 'Treasure', 1));
    expect([b.all('Treasure').length, b.all('Thopter').length]).toEqual([2, 2]);
  });
});
