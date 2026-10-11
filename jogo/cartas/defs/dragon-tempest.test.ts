import { describe, expect, it } from 'vitest';
import { destroy, putOntoBattlefield } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup, type TestGame } from '../../testes/harness.ts';

const D = 'Dragon Tempest';
const entra = (tg: TestGame, nome: string, p = 0) => tg.run(putOntoBattlefield(tg.g, [{ id: tg.find(nome, 'hand', p)!, controller: p }], 'effect'));

describe(D, () => {
  it('um Dragon com voar dispara as duas habilidades: ímpeto e X de dano', () => {
    const tg = setup({ battlefield: [[D, 'Thunderbreak Regent'], []], hand: [['Rapacious Dragon'], []] });
    tg.choose('qualquer alvo', ['Bruno']);
    entra(tg, 'Rapacious Dragon');
    tg.settle();
    // Tempest (ímpeto), Tempest (dano) e o Tesouro do próprio Rapacious Dragon
    expect(tg.state.zones.stack).toHaveLength(3);
    tg.resolveAll();
    expect(hasKw(tg.g, tg.bf('Rapacious Dragon'), 'haste')).toBe(true);
    expect(tg.life(1)).toBe(38);
    tg.passTo('cleanup');
    expect(hasKw(tg.g, tg.bf('Rapacious Dragon'), 'haste')).toBe(false);
  });
  it('criatura com voar que não é Dragon só ganha ímpeto; Dragon de oponente não dispara', () => {
    const tg = setup({ battlefield: [[D], []], hand: [['Birds of Paradise'], ['Rapacious Dragon']] });
    entra(tg, 'Birds of Paradise');
    tg.settle();
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolveAll();
    expect(hasKw(tg.g, tg.bf('Birds of Paradise'), 'haste')).toBe(true);
    entra(tg, 'Rapacious Dragon', 1);
    tg.settle();
    // só o Tesouro do Rapacious Dragon
    expect(tg.state.zones.stack).toHaveLength(1);
  });
  it('X é contado na resolução', () => {
    const tg = setup({ battlefield: [[D, 'Thunderbreak Regent'], []], hand: [['Rapacious Dragon'], []] });
    tg.choose('qualquer alvo', ['Bruno']);
    entra(tg, 'Rapacious Dragon');
    tg.settle();
    tg.run(destroy(tg.g, [tg.bf('Thunderbreak Regent')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(39);
  });
  it('o Dragon que entrou causa o dano mesmo fora do campo', () => {
    const tg = setup({ battlefield: [[D, 'Thunderbreak Regent'], []], hand: [['Rapacious Dragon'], []] });
    tg.choose('qualquer alvo', ['Bruno']);
    entra(tg, 'Rapacious Dragon');
    tg.settle();
    tg.run(destroy(tg.g, [tg.bf('Rapacious Dragon')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(39);
  });
});
