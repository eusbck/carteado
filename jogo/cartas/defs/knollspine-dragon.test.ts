import { describe, expect, it } from 'vitest';
import { dealDamage, gainLife } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Knollspine Dragon';

describe(N, () => {
  it('descarta a mão e compra cartas iguais ao dano causado ao oponente alvo no turno', () => {
    const tg = setup({ battlefield: [['Elvish Mystic'], []], hand: [['Hex'], []], library: [Array(8).fill('Mountain'), []] });
    dealDamage(tg.g, [{ source: tg.bf('Elvish Mystic'), target: { kind: 'player', id: 1 }, amount: 4, combat: false }]);
    gainLife(tg.g, 1, 10, null);
    tg.choose('oponente alvo', ['Bruno']).yes('Knollspine Dragon', true);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([7, 5]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(tg.names(0, 'graveyard')).toEqual(['Hex']);
    expect(tg.names(0, 'hand')).toHaveLength(4);
  });

  it('é opcional', () => {
    const tg = setup({ battlefield: [[], []], hand: [['Hex'], []], library: [Array(8).fill('Mountain'), []] });
    tg.choose('oponente alvo', ['Bruno']).yes('Knollspine Dragon', false);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Hex']);
  });
});
