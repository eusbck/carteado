import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Skullsnatcher';

describe(N, () => {
  it('exila até duas cartas só do cemitério do jogador atingido', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []], graveyard: [[], ['Forest', 'Island', 'Swamp'], ['Plains']] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('cemitério desse jogador')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id, d.items[1].id] };
    });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(opcoes.length).toBe(3);
    expect(tg.names(1, 'exile').length).toBe(2);
    expect(tg.names(1, 'graveyard').length).toBe(1);
    expect(tg.names(2, 'graveyard')).toEqual(['Plains']);
  });
});
