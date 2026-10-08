import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = "Bitterthorn, Nissa's Animus";

describe(NOME, () => {
  it('arma viva: cria um Germ 0/0 e se anexa a ele (fica 1/1)', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [[NOME], []] });
    tg.cast(NOME).resolve().resolve();
    const germe = tg.bf('Phyrexian Germ');
    expect(tg.state.objects[tg.bf(NOME)].attachedTo).toBe(germe);
    expect(tg.pt(germe)).toEqual([1, 1]);
  });
  it('quando a criatura equipada ataca, pode buscar terreno básico virado', () => {
    const tg = setup({ battlefield: [['Elvish Mystic', { name: NOME, attachTo: 'Elvish Mystic' }], []], library: [['Forest'], []] });
    tg.yes('terreno básico', true).choose('Procure uma carta', ['Forest']);
    tg.attack([['Elvish Mystic', 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
  });
});
