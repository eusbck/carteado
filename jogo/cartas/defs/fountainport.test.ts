import { describe, expect, it } from 'vitest';
import { chars, counter, hasKw } from '../../motor/api.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Fountainport';
describe(N, () => {
  it('entra desvirado e produz mana incolor', () => {
    expect(entraVirado(N)).toBe(false);
    expect(alternativasDeMana(N)).toEqual(['C']);
  });
  it('paga três manas e um de vida para criar um Fish azul 1/1', () => {
    const tg = setup({ battlefield: [[N, ...Array(3).fill('Island')], []] });
    tg.activate(N, 'Fish');
    expect(tg.life(0)).toBe(39);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    expect(tg.find('Fish')).toBeNull();
    tg.resolve();
    const id = tg.bf('Fish');
    expect(chars(tg.g, id).colors).toEqual(['U']);
    expect(chars(tg.g, id).subtypes).toEqual(['Fish']);
    expect(tg.pt(id)).toEqual([1, 1]);
    expect(hasKw(tg.g, id, 'flying')).toBe(false);
  });
  it('quatro manas criam um Tesouro, sem pagar vida', () => {
    const tg = setup({ battlefield: [[N, ...Array(4).fill('Island')], []] });
    tg.activate(N, 'Tesouro').resolve();
    expect(tg.find('Treasure')).not.toBeNull();
    expect(tg.life(0)).toBe(40);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
  it.each(['Fish', 'Treasure'])('sacrifica uma ficha %s como custo e compra só na resolução', (ficha) => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', { name: ficha, token: true }], []], library: [['Sol Ring'], []] });
    tg.choose('Sacrifique', [ficha]).activate(N, 'Compre');
    expect(tg.find(ficha)).toBeNull();
    expect(tg.names(0, 'hand')).toEqual([]);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
  });
  it('não oferece a compra sem fichas nem aceita uma criatura que não é ficha', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Indomitable Ancients'], []] });
    expect(tg.pending?.kind === 'priority' && tg.pending.actions.some((a) => a.obj === tg.bf(N) && a.label.includes('Compre'))).toBe(false);
  });
  it('CR 118.11: anular a habilidade não devolve a ficha sacrificada nem desvira o terreno', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', { name: 'Fish', token: true }], []], library: [['Sol Ring'], []] });
    tg.activate(N, 'Compre');
    runEffect(tg, counter(tg.g, tg.state.zones.stack[0]));
    expect(tg.find('Fish')).toBeNull();
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
