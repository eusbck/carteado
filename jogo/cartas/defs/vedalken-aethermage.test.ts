import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Vedalken Aethermage';

describe(N, () => {
  it('com lampejo; ao entrar, devolve um Sliver alvo (o polimorfo é Sliver)', () => {
    const tg = setup({ active: 1, battlefield: [['Island', 'Island'], ['Orvar, the All-Form']], hand: [[N], []] });
    tg.pass().choose('Sliver alvo', ['Orvar, the All-Form']).cast(N).resolveAll();
    expect(tg.names(1, 'hand')).toEqual(['Orvar, the All-Form']);
  });
  it('a ciclagem de Wizard procura uma carta de Wizard em vez de comprar', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []], library: [['Orvar, the All-Form', 'Spellseeker', 'Elvish Mystic'], []] });
    let servem: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Wizard')) return null;
      servem = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [] };
    });
    tg.activate(N).resolve();
    expect(servem).toEqual(['Orvar, the All-Form', 'Spellseeker']);
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});
