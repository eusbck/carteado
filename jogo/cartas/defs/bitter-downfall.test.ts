import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Bitter Downfall';

describe(N, () => {
  it('destrói a criatura alvo e o controlador dela perde 2 de vida', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Swamp')], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.life(1)).toBe(38);
  });

  it('custa {3} a menos se o alvo recebeu dano neste turno', () => {
    const tg = setup({ battlefield: [['Swamp', 'Elvish Mystic'], ['Indomitable Ancients', 'Silver Myr']], hand: [[N], []] });
    const anciao = tg.bf('Indomitable Ancients');
    dealDamage(tg.g, [{ source: tg.bf('Elvish Mystic'), target: { kind: 'obj', id: anciao }, amount: 1, combat: false }]);
    tg.refresh();
    // com duas manas: mirando a criatura sem dano, o custo cheio não pode ser pago
    expect(() => tg.choose('criatura alvo', ['Silver Myr']).cast(N)).toThrow();
    const de = setup({ battlefield: [['Swamp', 'Elvish Mystic'], ['Indomitable Ancients']], hand: [[N], []] });
    const alvo = de.bf('Indomitable Ancients');
    dealDamage(de.g, [{ source: de.bf('Elvish Mystic'), target: { kind: 'obj', id: alvo }, amount: 1, combat: false }]);
    de.refresh();
    de.choose('criatura alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(de.find('Indomitable Ancients')).toBeNull();
  });
});
