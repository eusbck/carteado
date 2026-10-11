import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Goblin Dark-Dwellers';
const lib = Array(10).fill('Mountain');

describe(N, () => {
  it('ao entrar, conjura de graça uma instantânea ou feitiço de valor 3 ou menos do cemitério, que é exilada', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [['Consider', 'Languish'], []], library: [lib, lib] });
    tg.choose('carta instantânea ou de feitiço alvo', ['Consider']).yes('Goblin Dark-Dwellers', true);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'menace')).toBe(true);
    expect(tg.names(0, 'exile')).toEqual(['Consider']);
    expect(tg.names(0, 'hand')).toHaveLength(1);
    expect(tg.names(0, 'graveyard')).toEqual(['Languish']);
  });

  it('é opcional: sem conjurar, a carta fica no cemitério', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [['Consider'], []], library: [lib, lib] });
    tg.choose('carta instantânea ou de feitiço alvo', ['Consider']).yes('Goblin Dark-Dwellers', false);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Consider']);
  });
});
