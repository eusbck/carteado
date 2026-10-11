import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { manaOptions } from '../../motor/costs.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'Plaza of Heroes';

function manaSemRestricao(campo: string[]): string[] {
  const tg = setup({ battlefield: [[NOME, ...campo], []] });
  const id = tg.bf(NOME);
  return [...new Set(manaOptions(tg.g, 0).filter((o) => o.obj === id && !o.def.restriction).map((o) => o.alt.join('')))].sort();
}

describe(NOME, () => {
  it('CR 106.6: a mana de qualquer cor só paga mágica lendária', () => {
    // Abrade ({1}{R}) não é lendária: só o {C} da praça e o do Sol Ring não pagam o {R}
    expect(setup({ battlefield: [[NOME, 'Sol Ring'], ['Indomitable Ancients']], hand: [['Abrade'], []] }).canCast('Abrade')).toBe(false);
    const tg = setup({ battlefield: [[NOME, 'Sol Ring'], []], hand: [['Gau, Feral Youth'], []] });
    tg.cast('Gau, Feral Youth').resolve();
    expect(tg.find('Gau, Feral Youth')).not.toBeNull();
  });
  it('{T}: uma mana de uma cor entre as permanentes lendárias que você controla', () => {
    expect(manaSemRestricao([])).toEqual(['C']);
    expect(manaSemRestricao(['Breena, the Demagogue'])).toEqual(['B', 'C', 'W']);
    // com Gau, a mana vermelha sem restrição paga Abrade
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Gau, Feral Youth'], ['Indomitable Ancients']], hand: [['Abrade'], []] });
    expect(tg.canCast('Abrade')).toBe(true);
  });
  it('{3}, {T}, exile: a criatura lendária alvo ganha resistência a magia e indestrutível até o fim do turno', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Plains', 'Gau, Feral Youth', 'Elvish Mystic'], []] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura lendária alvo')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Gau, Feral Youth')!.id] };
    });
    tg.activate(NOME, 'indestrutível').resolve();
    expect(alvos).toEqual(['Gau, Feral Youth']);
    expect(tg.names(0, 'exile')).toEqual([NOME]);
    const gau = tg.bf('Gau, Feral Youth');
    expect(hasKw(tg.g, gau, 'hexproof')).toBe(true);
    expect(hasKw(tg.g, gau, 'indestructible')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, gau, 'indestructible')).toBe(false);
  });
});
