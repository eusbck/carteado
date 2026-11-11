import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Cold-Blooded Crew';
const seis = ['Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Forest'];

describe(N, () => {
  it('ao entrar, põe dois marcadores +1/+1 na criatura alvo', () => {
    const tg = setup({ battlefield: [[...seis, 'Elvish Mystic'], []], hand: [[N], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast(N).resolveAll();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([3, 3]);
  });
  it('não pode ser bloqueada por criaturas com força 2 ou menos', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients', 'Elder Gargaroth']] });
    let podem: number[] = [];
    tg.script.push((d) => { if (d.kind === 'blockers') podem = d.candidates.map((x) => x.obj); return null; });
    tg.attack([[N, 1]]).passTo('combatDamage');
    expect(podem).toEqual([tg.bf('Elder Gargaroth')]);
  });
  it('ciclagem de terreno básico {2}: busca um terreno básico para a mão', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []], library: [['Sol Ring', 'Island'], []] });
    tg.choose('Procure', ['Island']).activate(N, 'Ciclagem').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});
