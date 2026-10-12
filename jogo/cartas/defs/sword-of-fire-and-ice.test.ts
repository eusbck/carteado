import { describe, expect, it } from 'vitest';
import { attach } from '../../motor/actions.ts';
import { kwParams } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sword of Fire and Ice';

describe(N, () => {
  it('+2/+2 e proteção contra vermelho e azul; no dano de combate a um jogador, 2 de dano a qualquer alvo e uma carta', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel'], ['Elvish Mystic']], library: [['Island', 'Island'], ['Island']] });
    attach(tg.g, tg.bf(N), tg.bf('Serra Angel'));
    tg.refresh();
    expect(tg.pt(tg.bf('Serra Angel'))).toEqual([6, 6]);
    expect(kwParams(tg.g, tg.bf('Serra Angel'), 'protection')).toHaveLength(2);
    tg.script.push((d) => { const i = d.kind === 'select' ? d.items.find((x) => x.label === 'Elvish Mystic') : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.attack([['Serra Angel', 1]]).passTo('main2', 0);
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});