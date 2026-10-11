import { describe, expect, it } from 'vitest';
import { putOntoBattlefield } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const H = 'Hammer of Nazahn';
const terrenos = (n: number) => Array(n).fill('Mountain');

describe(H, () => {
  it('ao entrar, pode anexar-se à criatura alvo: +2/+0 e indestrutível', () => {
    const tg = setup({ battlefield: [[...terrenos(4), 'Wall of Omens'], []], hand: [[H], []] });
    tg.yes('Hammer of Nazahn: anexar', true).choose('criatura alvo que você controla', ['Wall of Omens']);
    tg.cast(H).resolveAll();
    const wall = tg.bf('Wall of Omens');
    expect(tg.state.objects[tg.bf(H)].attachedTo).toBe(wall);
    expect(tg.pt(wall)).toEqual([2, 4]);
    expect(hasKw(tg.g, wall, 'indestructible')).toBe(true);
  });
  it('"você pode": recusando, o martelo fica desanexado', () => {
    const tg = setup({ battlefield: [[...terrenos(4), 'Wall of Omens'], []], hand: [[H], []] });
    tg.yes('Hammer of Nazahn: anexar', false);
    tg.cast(H).resolveAll();
    expect(tg.state.objects[tg.bf(H)].attachedTo).toBeNull();
  });
  it('outro Equipamento seu que entra também pode ser anexado', () => {
    const tg = setup({ battlefield: [['Mountain', H, 'Wall of Omens'], []], hand: [['Basilisk Collar'], []] });
    tg.yes('Hammer of Nazahn: anexar', true);
    tg.cast('Basilisk Collar').resolveAll();
    expect(tg.state.objects[tg.bf('Basilisk Collar')].attachedTo).toBe(tg.bf('Wall of Omens'));
    expect(tg.state.objects[tg.bf(H)].attachedTo).toBeNull();
  });
  it('Equipamento de um oponente não dispara', () => {
    const tg = setup({ battlefield: [[H, 'Wall of Omens'], ['Mountain', 'Indomitable Ancients']], hand: [[], ['Basilisk Collar']], active: 1 });
    tg.cast('Basilisk Collar').resolve();
    expect(tg.state.zones.stack).toHaveLength(0);
    expect(tg.state.objects[tg.bf('Basilisk Collar')].attachedTo).toBeNull();
  });
  it('entrando junto com outro Equipamento, dispara para cada um', () => {
    const tg = setup({ battlefield: [['Wall of Omens'], []], hand: [[H, 'Basilisk Collar'], []] });
    const ids = [tg.find(H, 'hand')!, tg.find('Basilisk Collar', 'hand')!];
    tg.yes('Hammer of Nazahn: anexar', true).yes('Hammer of Nazahn: anexar', true);
    tg.run(putOntoBattlefield(tg.g, ids.map((id) => ({ id, controller: 0 })), 'effect'));
    tg.settle();
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolveAll();
    const wall = tg.bf('Wall of Omens');
    expect(tg.state.objects[tg.bf(H)].attachedTo).toBe(wall);
    expect(tg.state.objects[tg.bf('Basilisk Collar')].attachedTo).toBe(wall);
  });
  it('CR 702.12b: o dano marcado fica; ao mover o martelo, a criatura antes indestrutível morre', () => {
    const tg = setup({ battlefield: [[...terrenos(4), { name: H, attachTo: 'Indomitable Ancients' }, { name: 'Indomitable Ancients', damage: 10 }, 'Wall of Omens'], []] });
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    tg.choose('criatura alvo que você controla', ['Wall of Omens']);
    tg.activate(H, 'Equipar').resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.state.objects[tg.bf(H)].attachedTo).toBe(tg.bf('Wall of Omens'));
  });
});
