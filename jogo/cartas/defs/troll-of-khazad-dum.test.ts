import { describe, expect, it } from 'vitest';
import { validateBlocks } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';
import { setup as montar } from '../../testes/harness.ts';

const N = 'Troll of Khazad-dûm';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('só pode ser bloqueado por três ou mais criaturas', () => {
    const tg = setup({ battlefield: [[N], ['Elvish Mystic', 'Silver Myr', 'Indomitable Ancients']], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([6, 5]);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    const [a, b, c] = ['Elvish Mystic', 'Silver Myr', 'Indomitable Ancients'].map((n) => tg.bf(n));
    expect(validateBlocks(tg.g, 1, [[a, id]])).not.toBeNull();
    expect(validateBlocks(tg.g, 1, [[a, id], [b, id]])).not.toBeNull();
    expect(validateBlocks(tg.g, 1, [[a, id], [b, id], [c, id]])).toBeNull();
    expect(validateBlocks(tg.g, 1, [])).toBeNull();
  });

  it('ciclagem de pântano {1}: descarta e busca uma carta de Swamp', () => {
    const tg = montar({ battlefield: [['Island'], []], hand: [[N], []], library: [['Island', 'Swamp', 'Island'], []] });
    tg.choose('Procure', ['Swamp']);
    tg.activate(N, 'iclagem').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});
