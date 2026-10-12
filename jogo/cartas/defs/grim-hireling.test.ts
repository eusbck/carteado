import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Grim Hireling';

describe(N, () => {
  it('criaturas suas causando dano de combate a um jogador criam dois Treasures; {B} e X Treasures: -X/-X', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel', 'Swamp'], ['Indomitable Ancients']] });
    tg.attack([[N, 1], ['Serra Angel', 1]]).passTo('main2', 0);
    expect(tg.all('Treasure')).toHaveLength(2);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Sacrifique') ? { kind: 'select', ids: d.items.slice(0, 2).map((i) => i.id) } : null));
    tg.number('X', 2).choose('criatura alvo', ['Indomitable Ancients']).activate(N).resolveAll();
    expect(tg.all('Treasure')).toHaveLength(0);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([0, 8]);
  });
});