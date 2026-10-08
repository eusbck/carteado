import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { addEffect, destroy, hasKw } from '../../motor/api.ts';

describe('Death Baron', () => {
  it('Skeletons e outros Zombies que você controla recebem +1/+1 e toque mortífero', () => {
    const tg = setup({ battlefield: [['Death Baron', "Teacher's Pest", { name: 'Zombie 2/2', token: true }, 'Wall of Omens'], [{ name: 'Zombie 2/2', token: true }]] });
    const z0 = tg.find('Zombie 2/2', 'battlefield', 0)!;
    const z1 = tg.find('Zombie 2/2', 'battlefield', 1)!;
    expect(tg.pt(z0)).toEqual([3, 3]);
    expect(hasKw(tg.g, z0, 'deathtouch')).toBe(true);
    expect(tg.pt(tg.bf("Teacher's Pest"))).toEqual([2, 2]);
    expect(hasKw(tg.g, tg.bf("Teacher's Pest"), 'deathtouch')).toBe(true);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'deathtouch')).toBe(false);
    expect(tg.pt(z1)).toEqual([2, 2]);
    expect(hasKw(tg.g, z1, 'deathtouch')).toBe(false);
  });
  it('Skeleton e Zombie ao mesmo tempo recebe o bônus uma vez só', () => {
    const tg = setup({ battlefield: [['Death Baron', "Teacher's Pest"], []] });
    const pest = tg.bf("Teacher's Pest");
    addEffect(tg.g, { source: pest, sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [pest], mods: [{ k: 'addTypes', subtypes: ['Zombie'] }] });
    tg.refresh();
    expect(tg.pt(tg.bf("Teacher's Pest"))).toEqual([2, 2]);
  });
  it('não afeta a si mesmo, a menos que vire Skeleton', () => {
    const tg = setup({ battlefield: [['Death Baron'], []] });
    const b = tg.bf('Death Baron');
    expect(tg.pt(b)).toEqual([2, 2]);
    expect(hasKw(tg.g, b, 'deathtouch')).toBe(false);
    addEffect(tg.g, { source: b, sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [b], mods: [{ k: 'addTypes', subtypes: ['Skeleton'] }] });
    tg.refresh();
    expect(tg.pt(tg.bf('Death Baron'))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf('Death Baron'), 'deathtouch')).toBe(true);
  });
  it('CR 704.5g: dano não letal fica letal quando Death Baron sai do campo', () => {
    const tg = setup({ battlefield: [['Death Baron', { name: 'Zombie 2/2', token: true, damage: 2 }], []] });
    expect(tg.find('Zombie 2/2')).not.toBeNull();
    tg.run(destroy(tg.g, [tg.bf('Death Baron')]));
    tg.resolveAll();
    expect(tg.find('Zombie 2/2')).toBeNull();
  });
});
