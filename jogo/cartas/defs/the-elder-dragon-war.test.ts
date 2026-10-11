import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'The Elder Dragon War';
const montanhas = ['Mountain', 'Mountain', 'Mountain', 'Mountain'];
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('CR 702.155a: entrando no capítulo III, só ele dispara, e a Saga é sacrificada depois', () => {
    const tg = setup({ battlefield: [[...montanhas, 'Indomitable Ancients'], ['Indomitable Ancients']], hand: [[N, 'Island'], []], library: [forests, forests] });
    tg.number('Ler adiante', 3).cast(N).resolveAll();
    const dragao = tg.bf('Dragon');
    expect(tg.pt(dragao)).toEqual([4, 4]);
    // os capítulos I e II foram pulados: sem dano e sem descarte
    expect(tg.life(1)).toBe(40);
    expect(tg.state.objects[tg.bf('Indomitable Ancients', 1)].damage).toBe(0);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.find(N)).toBeNull();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });

  it('capítulo I: 2 de dano a cada criatura e a cada oponente; depois segue para o II e o III nos turnos seguintes', () => {
    const tg = setup({ players: 3, battlefield: [[...montanhas, 'Indomitable Ancients'], ['Indomitable Ancients'], []], hand: [[N, 'Island', 'Swamp'], [], []], library: [['Plains', 'Plains', 'Plains', ...forests], forests, forests] });
    tg.number('Ler adiante', 1).cast(N).resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 38, 38]);
    expect(tg.state.objects[tg.bf('Indomitable Ancients', 0)].damage).toBe(2);
    expect(tg.state.objects[tg.bf('Indomitable Ancients', 1)].damage).toBe(2);
    expect(tg.state.objects[tg.bf(N)].counters.lore).toBe(1);
    // próximo turno seu: capítulo II, descarta duas e compra duas
    tg.choose('descarte quantas cartas quiser', ['Island', 'Swamp']);
    tg.passTo('upkeep', 1);
    tg.passTo('main1', 0);
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.lore).toBe(2);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Island', 'Swamp']);
    // comprou uma no passo de compra e duas pelo capítulo
    expect(tg.names(0, 'hand')).toHaveLength(3);
    // e no turno seguinte, o capítulo III
    tg.passTo('upkeep', 1);
    tg.passTo('main1', 0);
    tg.resolveAll();
    expect(tg.find('Dragon')).not.toBeNull();
    expect(tg.find(N)).toBeNull();
  });

  it('capítulo II sem descartar nada: não compra', () => {
    const tg = setup({ battlefield: [montanhas, []], hand: [[N, 'Island'], []], library: [forests, forests] });
    tg.number('Ler adiante', 2);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('descarte quantas cartas quiser') ? { kind: 'select', ids: [] } : null));
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.life(1)).toBe(40);
  });
});
