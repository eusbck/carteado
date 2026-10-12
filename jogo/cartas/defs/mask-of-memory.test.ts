import { describe, expect, it } from 'vitest';
import { attach } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mask of Memory';

describe(N, () => {
  it('a criatura equipada que causa dano de combate a um jogador deixa você comprar duas cartas e descartar uma', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel'], []], library: [['Island', 'Swamp', 'Forest'], ['Island']] });
    attach(tg.g, tg.bf(N), tg.bf('Serra Angel'));
    tg.refresh();
    tg.script.push((d) => (d.kind === 'select' && /[Dd]escart/.test(d.prompt) ? { kind: 'select', ids: [d.items[0].id] } : null));
    tg.yes('Mask of Memory', true).attack([['Serra Angel', 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toHaveLength(1);
    expect(tg.names(0, 'graveyard')).toHaveLength(1);
  });
});