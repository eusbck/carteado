import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';
import { suspeita } from '../culpa.ts';

const NELLY = 'Nelly Borca, Impulsive Accuser';

describe(NELLY, () => {
  it('tem vigilância; ao atacar, suspeita da criatura alvo e goada todas as suspeitas', () => {
    const tg = setup({ players: 3, battlefield: [[NELLY], ['Indomitable Ancients', 'Wall of Omens'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).attack([[NELLY, 1]]).passTo('declareBlockers');
    const anc = tg.bf('Indomitable Ancients');
    expect(suspeita(tg.g, anc)).toBe(true);
    expect(hasKw(tg.g, anc, 'menace')).toBe(true);
    expect(hasKw(tg.g, anc, 'cantBlock')).toBe(true);
    expect(tg.state.objects[anc].goadedBy.map((x) => x.player)).toEqual([0]);
    expect(tg.state.objects[tg.bf('Wall of Omens')].goadedBy).toEqual([]);
    expect(tg.state.objects[tg.bf(NELLY)].tapped).toBe(false);
  });

  it('pode mirar uma criatura que já está suspeita: nada muda nela, e as suspeitas são goadadas', () => {
    const tg = setup({ players: 3, battlefield: [[NELLY], ['Indomitable Ancients'], ['Wall of Omens']] });
    const anc = tg.bf('Indomitable Ancients');
    tg.state.objects[anc].data.suspeita = true; // já suspeita
    tg.choose('criatura alvo', ['Indomitable Ancients']).attack([[NELLY, 2]]).passTo('declareBlockers');
    expect(suspeita(tg.g, anc)).toBe(true);
    expect(tg.state.objects[anc].goadedBy.map((x) => x.player)).toEqual([0]);
  });

  it('criaturas de um oponente causam dano de combate a outro oponente: você e esse oponente compram uma carta', () => {
    const tg = setup({
      players: 3, active: 1,
      battlefield: [[NELLY], ['Indomitable Ancients'], []],
      library: [['Island', 'Island'], ['Forest', 'Forest'], ['Plains']],
    });
    tg.attack([['Indomitable Ancients', 2]]).passTo('main2');
    tg.resolveAll();
    expect(tg.life(2)).toBe(38);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.names(1, 'hand')).toEqual(['Forest']);
    expect(tg.names(2, 'hand')).toEqual([]);
  });

  it('dano de combate a você não dispara', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [[], ['Indomitable Ancients'], [NELLY]], library: [['Island'], ['Forest'], ['Plains']] });
    // Nelly é de Carla, e Bruno ataca a própria Carla: o dano não é num oponente dela
    tg.attack([['Indomitable Ancients', 2]]).passTo('main2');
    tg.resolveAll();
    expect(tg.names(2, 'hand')).toEqual([]);
    expect(tg.names(1, 'hand')).toEqual([]);
  });
});
