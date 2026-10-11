import { describe, expect, it } from 'vitest';
import { destroy, exile } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Timothar, Baron of Bats';
const lib = Array(10).fill('Swamp');

describe(N, () => {
  it('pagando {1}, exila o Vampire que morreu e cria um Bat; o dano de combate do Bat o sacrifica e devolve a carta virada', () => {
    const tg = setup({ battlefield: [[N, 'Vampire Nighthawk', 'Swamp'], []], library: [lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    tg.yes('Pagar', true);
    tg.run(destroy(tg.g, [tg.bf('Vampire Nighthawk')]));
    tg.resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Vampire Nighthawk']);
    const morcego = tg.bf('Bat');
    expect(tg.pt(morcego)).toEqual([1, 1]);
    expect(hasKw(tg.g, morcego, 'flying')).toBe(true);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.attack([[morcego, 1]]).passTo('main2', 0);
    expect(tg.find('Bat')).toBeNull();
    const gaviao = tg.bf('Vampire Nighthawk');
    expect(tg.state.objects[gaviao].tapped).toBe(true);
    expect(tg.names(0, 'exile')).toEqual([]);
  });

  it('se a carta já saiu do cemitério, nada é pago nem criado', () => {
    const tg = setup({ battlefield: [[N, 'Vampire Nighthawk', 'Swamp'], []], library: [lib, lib] });
    tg.yes('Pagar', true);
    tg.run(destroy(tg.g, [tg.bf('Vampire Nighthawk')]));
    tg.run(exile(tg.g, [...tg.state.zones.graveyard[0]]));
    tg.resolveAll();
    expect(tg.all('Bat')).toHaveLength(0);
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(false);
  });

  it('resguardo — descartar uma carta: o oponente que o mira descarta ou tem a mágica anulada', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Swamp', 'Swamp']], hand: [[], ['Urge to Feed', 'Hex']], library: [lib, lib] });
    tg.choose('criatura alvo', [N]).yes('Resguardo', true).choose('Descarte', ['Hex']);
    tg.cast('Urge to Feed').resolveAll();
    expect(tg.names(1, 'graveyard').sort()).toEqual(['Hex', 'Urge to Feed']);
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);

    const sem = setup({ active: 1, battlefield: [[N], ['Swamp', 'Swamp']], hand: [[], ['Urge to Feed']], library: [lib, lib] });
    sem.choose('criatura alvo', [N]);
    sem.cast('Urge to Feed').resolveAll();
    // sem carta na mão para descartar: a mágica é anulada
    expect(sem.pt(sem.bf(N))).toEqual([4, 4]);
  });
});
