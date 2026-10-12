import { describe, expect, it } from 'vitest';
import { attach } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Foot Chopper';

describe(N, () => {
  it('ao entrar cria um Ninja 1/1 e se anexa a ele; a criatura equipada tem voar', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const ninja = tg.bf('Ninja');
    expect(tg.pt(ninja)).toEqual([1, 1]);
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(ninja);
    expect(hasKw(tg.g, ninja, 'flying')).toBe(true);
  });

  it('a criatura equipada que causa dano de combate a um jogador pode ser sacrificada para comprar cartas iguais à força dela', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []], library: [['Island', 'Island', 'Island'], ['Island']] });
    attach(tg.g, tg.bf(N), tg.bf('Silver Myr'));
    tg.refresh();
    tg.yes('Foot Chopper', true).attack([['Silver Myr', 1]]).passTo('main2', 0);
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.find(N)).not.toBeNull();
  });
});