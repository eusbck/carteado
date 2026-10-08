import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';
import { addEffect } from '../../motor/api.ts';
import type { TestGame } from '../../testes/harness.ts';

const grimorios = [['Island', 'Island'], ['Island', 'Island']];
const ateMinhaManutencao = (tg: TestGame) => tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');

describe('Dreadhorde Invasion', () => {
  it('na manutenção, perde 1 de vida e cria a Zombie Army 0/0 com um marcador +1/+1', () => {
    const tg = setup({ battlefield: [['Dreadhorde Invasion'], []], library: grimorios });
    ateMinhaManutencao(tg).resolve();
    expect(tg.life(0)).toBe(39);
    const army = tg.bf('Zombie Army', 0);
    expect(tg.pt(army)).toEqual([1, 1]);
    expect(chars(tg.g, army).colors).toEqual(['B']);
    // na manutenção seguinte, o marcador vai para a mesma Army
    tg.passUntil((x) => x.state.turn.active === 1);
    ateMinhaManutencao(tg).resolve();
    expect(tg.all('Zombie Army').length).toBe(1);
    expect(tg.pt(army)).toEqual([2, 2]);
    expect(tg.life(0)).toBe(38);
  });

  it('no turno do oponente não dispara', () => {
    const tg = setup({ battlefield: [['Dreadhorde Invasion'], []], library: grimorios });
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'draw');
    expect(tg.life(0)).toBe(40);
    expect(tg.find('Zombie Army')).toBeNull();
  });

  it('com duas Armies, você escolhe; uma Army que não é Zombie passa a ser', () => {
    const tg = setup({ battlefield: [['Dreadhorde Invasion', { name: 'Zombie Army', token: true, counters: { '+1/+1': 2 } }, 'Indomitable Ancients'], []], library: grimorios });
    // Indomitable Ancients vira uma Army (sem ser Zombie) por um efeito de teste
    const ancients = tg.bf('Indomitable Ancients');
    addEffect(tg.g, { source: ancients, sourceDef: '', controller: 0, duration: { kind: 'permanent' }, affected: [ancients], mods: [{ k: 'addTypes', subtypes: ['Army'] }] });
    tg.refresh();
    expect(chars(tg.g, ancients).subtypes).not.toContain('Zombie');
    tg.choose('Amassar Zombies 1', ['Indomitable Ancients']);
    ateMinhaManutencao(tg).resolve();
    expect(tg.state.objects[ancients].counters['+1/+1']).toBe(1);
    expect(chars(tg.g, ancients).subtypes).toContain('Zombie');
    expect(tg.pt(tg.bf('Zombie Army'))).toEqual([2, 2]);
  });

  it('ficha de Zombie com força 6 ou mais ganha vínculo com a vida ao atacar', () => {
    const tg = setup({ battlefield: [['Dreadhorde Invasion', { name: 'Zombie Army', token: true, counters: { '+1/+1': 6 } }], []], library: grimorios });
    tg.attack([['Zombie Army', 1]]).passTo('combatDamage');
    expect(hasKw(tg.g, tg.bf('Zombie Army'), 'lifelink')).toBe(true);
    expect(tg.life(1)).toBe(34);
    expect(tg.life(0)).toBe(46);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, tg.bf('Zombie Army'), 'lifelink')).toBe(false);
  });

  it('qualquer ficha de Zombie com força 6 ou mais ganha vínculo ao atacar, não só a Army', () => {
    const tg = setup({ battlefield: [['Dreadhorde Invasion', { name: 'Zombie 2/2', token: true, counters: { '+1/+1': 4 } }, { name: 'Zombie Army', token: true, counters: { '+1/+1': 5 } }], []], library: grimorios });
    tg.attack([['Zombie', 1], ['Zombie Army', 1]]).passTo('declareBlockers');
    expect(hasKw(tg.g, tg.bf('Zombie'), 'lifelink')).toBe(true);
    // força 5: não dispara
    expect(hasKw(tg.g, tg.bf('Zombie Army'), 'lifelink')).toBe(false);
  });

  it('a força é vista ao atacar: aumentar depois não dá vínculo', () => {
    const tg = setup({ battlefield: [['Dreadhorde Invasion', { name: 'Zombie Army', token: true, counters: { '+1/+1': 5 } }], []], library: grimorios });
    tg.attack([['Zombie Army', 1]]).passTo('declareBlockers');
    const army = tg.bf('Zombie Army');
    tg.state.objects[army].counters['+1/+1'] = 7;
    tg.g.bump();
    tg.refresh().passTo('combatDamage');
    expect(tg.pt(army)).toEqual([7, 7]);
    expect(hasKw(tg.g, army, 'lifelink')).toBe(false);
    expect(tg.life(0)).toBe(40);
  });

  it('com o gatilho na pilha, diminuir a força não impede o vínculo', () => {
    const tg = setup({ battlefield: [['Dreadhorde Invasion', { name: 'Zombie Army', token: true, counters: { '+1/+1': 6 } }], []], library: grimorios });
    tg.attack([['Zombie Army', 1]]).passUntil((x) => x.state.turn.step === 'declareAttackers' && x.state.zones.stack.length > 0);
    const army = tg.bf('Zombie Army');
    tg.state.objects[army].counters['+1/+1'] = 2;
    tg.g.bump();
    tg.refresh().resolve();
    expect(hasKw(tg.g, army, 'lifelink')).toBe(true);
  });

  it('criatura que não é ficha não ganha vínculo', () => {
    const tg = setup({ battlefield: [['Dreadhorde Invasion', { name: 'Indomitable Ancients', counters: { '+1/+1': 6 } }], []], library: grimorios });
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'lifelink')).toBe(false);
  });
});
