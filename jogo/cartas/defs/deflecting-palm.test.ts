import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { dealDamage } from '../../motor/api.ts';

const NOME = 'Deflecting Palm';

describe(NOME, () => {
  it('escolhe a fonte na resolução; o próximo dano dela a você é prevenido e devolvido ao controlador dela, uma vez só', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains'], ['Indomitable Ancients', 'Wall of Omens']], hand: [[NOME], []] });
    tg.choose('Deflecting Palm: escolha a fonte', ['Indomitable Ancients']).cast(NOME).resolve();
    const anc = tg.bf('Indomitable Ancients');
    // outra fonte não é prevenida
    dealDamage(tg.g, [{ source: tg.bf('Wall of Omens'), target: { kind: 'player', id: 0 }, amount: 1, combat: false }]);
    expect(tg.life(0)).toBe(39);
    dealDamage(tg.g, [{ source: anc, target: { kind: 'player', id: 0 }, amount: 4, combat: false }]);
    expect(tg.life(0)).toBe(39);
    expect(tg.life(1)).toBe(36);
    // só a próxima vez
    dealDamage(tg.g, [{ source: anc, target: { kind: 'player', id: 0 }, amount: 2, combat: false }]);
    expect(tg.life(0)).toBe(37);
    expect(tg.life(1)).toBe(36);
  });
});
