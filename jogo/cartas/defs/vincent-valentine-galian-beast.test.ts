import { describe, expect, it } from 'vitest';
import { destroy, nameOf } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const NOME = 'Vincent Valentine // Galian Beast';

describe(NOME, () => {
  it('quando uma criatura de um oponente morre, recebe marcadores iguais à força dela', () => {
    const tg = setup({ battlefield: [[NOME], ['Indomitable Ancients']] });
    tg.run(destroy(tg.g, [tg.bf('Indomitable Ancients')]));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(NOME)].counters['+1/+1']).toBe(2);
  });

  it('ao atacar, pode transformar; Galian Beast morrendo volta virado com a frente para cima', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [[NOME], []], library: [['Island'], ['Island']] });
    tg.yes('transformar');
    tg.attack([[NOME, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    const id = tg.bf(NOME);
    expect(nameOf(tg.g, id)).toBe('Galian Beast');
    tg.run(destroy(tg.g, [id]));
    tg.resolveAll();
    const volta = tg.bf(NOME);
    expect(tg.state.objects[volta].face).toBe(0);
    expect(tg.state.objects[volta].tapped).toBe(true);
    expect(nameOf(tg.g, volta)).toBe('Vincent Valentine');
  });
});
