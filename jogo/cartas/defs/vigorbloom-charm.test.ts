import { describe, expect, it } from 'vitest';
import { destroy, exile, hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Vigorbloom Charm';
const MANA = ['Forest', 'Plains'];
const PROTEGE = 'A permanente alvo que você controla ganha resistência a magia e indestrutível até o fim do turno';
const COMPRA = 'Você compra uma carta e ganha 3 pontos de vida';
const LUTA = 'Coloque um marcador +1/+1 na sua criatura alvo e ela luta com a criatura alvo de um oponente';

describe(N, () => {
  it('protege inclusive um terreno e a proteção termina no fim do turno', () => {
    const tg = setup({ battlefield: [MANA, []], hand: [[N], []], library: [['Forest'], ['Island']] });
    tg.choose('modo', [PROTEGE]).choose('permanente alvo', ['Plains']).cast(N).resolve();
    expect(hasKw(tg.g, tg.bf('Plains'), 'hexproof')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Plains'), 'indestructible')).toBe(true);
    tg.run(destroy(tg.g, [tg.bf('Plains')]));
    expect(tg.find('Plains')).not.toBeNull();
    tg.passTo('cleanup');
    expect(hasKw(tg.g, tg.bf('Plains'), 'hexproof')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Plains'), 'indestructible')).toBe(false);
  });

  it('sem criaturas no campo, pode escolher comprar uma carta e ganhar 3 de vida', () => {
    const tg = setup({ life: 20, battlefield: [MANA, []], hand: [[N], []], library: [['Sol Ring'], []] });
    tg.choose('modo', [COMPRA]).cast(N).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.life(0)).toBe(23);
    expect(tg.life(1)).toBe(20);
  });

  it('coloca o marcador antes da luta e as duas criaturas causam dano', () => {
    const tg = setup({ battlefield: [[...MANA, 'Indomitable Ancients'], ['Indomitable Ancients']], hand: [[N], []] });
    const minha = tg.bf('Indomitable Ancients', 0);
    const oponente = tg.bf('Indomitable Ancients', 1);
    tg.choose('modo', [LUTA]).choose('criatura alvo que você controla', [minha]).choose('criatura alvo que um oponente controla', [oponente]).cast(N).resolve();
    expect(tg.pt(minha)).toEqual([3, 11]);
    expect(tg.state.objects[minha].damage).toBe(2);
    expect(tg.state.objects[oponente].damage).toBe(3);
    expect(tg.state.objects[oponente].counters).toEqual({});
  });

  it('CR 701.14b: sem o alvo do oponente, ainda coloca o marcador, mas não luta', () => {
    const tg = setup({ battlefield: [[...MANA, 'Indomitable Ancients'], ['Elvish Mystic']], hand: [[N], []] });
    tg.choose('modo', [LUTA]).choose('criatura alvo que você controla', ['Indomitable Ancients']).choose('criatura alvo que um oponente controla', ['Elvish Mystic']).cast(N);
    tg.run(exile(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolve();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([3, 11]);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(0);
  });

  it('CR 701.14b: sem a sua criatura alvo, a criatura do oponente não causa nem recebe dano', () => {
    const tg = setup({ battlefield: [[...MANA, 'Elvish Mystic'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('modo', [LUTA]).choose('criatura alvo que você controla', ['Elvish Mystic']).choose('criatura alvo que um oponente controla', ['Indomitable Ancients']).cast(N);
    tg.run(exile(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(0);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters).toEqual({});
  });
});
