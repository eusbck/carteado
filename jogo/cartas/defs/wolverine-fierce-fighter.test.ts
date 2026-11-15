import { describe, expect, it } from 'vitest';
import { dealDamage, destroy, hasKw } from '../../motor/api.ts';
import { enterCard, fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Wolverine, Fierce Fighter';

describe(N, () => {
  it('entra e luta com até uma outra criatura, causando dano igual à força de cada uma', () => {
    const tg = setup({ battlefield: [[], ['Indomitable Ancients']] });
    tg.choose('outra criatura alvo', ['Indomitable Ancients']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 5]);
    expect(tg.state.objects[tg.bf(N)].damage).toBe(2);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
  });
  it('pode escolher zero alvos e tem ímpeto para atacar no turno em que entra', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Mountain', 'Mountain'], []], hand: [[N], []] });
    tg.choose('outra criatura alvo', []).cast(N).resolveAll();
    expect(hasKw(tg.g, tg.bf(N), 'haste')).toBe(true);
    tg.attack([[N, 1]]).passTo('main2');
    expect(tg.life(1)).toBe(37);
  });
  it('CR 701.14b: não luta se Wolverine deixar de estar no campo antes de resolver o gatilho', () => {
    const tg = setup({ battlefield: [[], ['Indomitable Ancients']] });
    tg.choose('outra criatura alvo', ['Indomitable Ancients']);
    enterCard(tg, N, 0);
    runEffect(tg, destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(0);
  });
  it('cura o dano da luta ao sofrer outro evento de dano, sem usar a pilha', () => {
    const tg = setup({ battlefield: [[], ['Indomitable Ancients']] });
    tg.choose('outra criatura alvo', ['Indomitable Ancients']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'obj', id: tg.bf(N) }, amount: 3, combat: false }]);
    tg.refresh();
    expect(tg.find(N)).not.toBeNull();
    expect(tg.state.objects[tg.bf(N)].damage).toBe(3);
    expect(tg.state.zones.stack).toHaveLength(0);
  });
  it('CR 120.4: todo o dano simultâneo conta junto e pode ser letal', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients', 'Wall of Omens']] });
    dealDamage(tg.g, ['Indomitable Ancients', 'Wall of Omens'].map((n) => ({ source: tg.bf(n), target: { kind: 'obj' as const, id: tg.bf(N) }, amount: 3, combat: false })));
    tg.refresh();
    expect(tg.find(N)).toBeNull();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });
  it('curar dano não protege contra destruição', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, destroy(tg.g, [tg.bf(N)]));
    expect(tg.find(N)).toBeNull();
  });
});
