import { describe, expect, it } from 'vitest';
import { discard } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Stensia Masquerade';
const V = 'Stromkirk Occultist';

describe(N, () => {
  it('as criaturas atacantes que você controla têm iniciativa, só enquanto atacam', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients', 'Elvish Mystic'], ['Wall of Omens']] });
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'first strike')).toBe(false);
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'first strike')).toBe(true);
    // quem não ataca e as criaturas do oponente não ganham
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'first strike')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'first strike')).toBe(false);
    tg.passTo('main2');
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'first strike')).toBe(false);
  });

  it('um Vampire seu que causa dano de combate a um jogador recebe um marcador +1/+1; quem não é Vampire não recebe', () => {
    const tg = setup({ battlefield: [[N, V, 'Indomitable Ancients'], []], library: [['Plains', 'Plains'], ['Island']] });
    tg.attack([[V, 1], ['Indomitable Ancients', 1]]).passTo('main2');
    expect(tg.state.objects[tg.bf(V)].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters['+1/+1'] ?? 0).toBe(0);
    expect(tg.life(1)).toBe(40 - 3 - 2);
  });

  it('conjurada pela loucura no turno de outro jogador, entra no campo', () => {
    const tg = setup({ active: 1, battlefield: [['Mountain', 'Mountain', 'Mountain'], []], hand: [[N], []] });
    tg.yes('Loucura', true);
    tg.run(discard(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.find(N)).not.toBeNull();
    expect(tg.state.turn.active).toBe(1);
  });

  it('sem conjurar, vai para o cemitério', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], []], hand: [[N], []] });
    tg.yes('Loucura', false);
    tg.run(discard(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });
});
