import { describe, expect, it } from 'vitest';
import { dealDamage, draw } from '../../motor/api.ts';
import { chars, hasKw, nameOf } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "King T'Challa // Black Panther, Hope Enduring";
const terrenos = (n: number) => Array.from({ length: n }, (_, i) => (i % 2 ? 'Island' : 'Plains'));

describe(N, () => {
  it('frente: King T\'Challa 3/2 com lampejo, conjurado no turno do oponente', () => {
    const tg = setup({ active: 1, battlefield: [terrenos(3), []], hand: [[N], []] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    tg.cast(N, 'hand').resolveAll();
    const id = tg.bf(N);
    expect(nameOf(tg.g, id)).toBe("King T'Challa");
    expect(tg.pt(id)).toEqual([3, 2]);
    expect(hasKw(tg.g, id, 'flash')).toBe(true);
  });

  it('sempre que um jogador compra a segunda carta dele no turno, você compra uma', () => {
    const tg = setup({ battlefield: [[N], []] });
    // a primeira compra do oponente não dispara; a segunda, sim; a terceira, não
    tg.run(draw(tg.g, 1, 1));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(0);
    tg.run(draw(tg.g, 1, 1));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(1);
    tg.run(draw(tg.g, 1, 1));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(1);
    // a sua segunda compra (a primeira foi a do gatilho) também conta
    tg.run(draw(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(3);
  });

  it('{4}{W}{U}: transforma em Black Panther, só como feitiço', () => {
    const tg = setup({ active: 1, battlefield: [[N, ...terrenos(6)], []] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
    tg.passTo('main1', 0);
    tg.activate("King T'Challa").resolveAll();
    const id = tg.bf(N);
    expect(nameOf(tg.g, id)).toBe('Black Panther, Hope Enduring');
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(hasKw(tg.g, id, 'double strike')).toBe(true);
    // o verso não tem a habilidade de transformar: não volta
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });

  it('CR 712.11b: o verso também pode ser conjurado direto, por {4}{W}{U}', () => {
    const tg = setup({ battlefield: [terrenos(6), []], hand: [[N], []] });
    tg.cast(N, 'hand@1').resolveAll();
    const id = tg.bf(N);
    expect(nameOf(tg.g, id)).toBe('Black Panther, Hope Enduring');
    expect(chars(tg.g, id).manaValue).toBe(6);
  });

  it('Black Panther: todo dano a ele é prevenido; ao causar dano de combate a um jogador, você compra uma carta', () => {
    const tg = setup({ battlefield: [terrenos(6), ['Indomitable Ancients']], hand: [[N], []] });
    tg.cast(N, 'hand@1').resolveAll();
    const id = tg.bf(N);
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'obj', id }, amount: 5, combat: false }]);
    tg.refresh();
    expect(tg.state.objects[id].damage).toBe(0);
    expect(tg.find(N)).not.toBeNull();
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    const antes = tg.names(0, 'hand').length;
    tg.attack([[N, 1]]).block([]).passTo('main2', 0);
    // golpe duplo: dois golpes de 3 e duas compras
    expect(tg.life(1)).toBe(34);
    expect(tg.names(0, 'hand')).toHaveLength(antes + 2);
  });
});
