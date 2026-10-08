import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { exile } from '../../motor/api.ts';

describe('Cemetery Reaper', () => {
  it('as outras criaturas Zombie que você controla recebem +1/+1, inclusive as fichas', () => {
    const tg = setup({ battlefield: [['Cemetery Reaper', { name: 'Zombie 2/2', token: true }, "Stitcher's Supplier", 'Wall of Omens'], [{ name: 'Zombie 2/2', token: true }]] });
    expect(tg.pt(tg.bf('Cemetery Reaper'))).toEqual([2, 2]);
    expect(tg.pt(tg.find('Zombie 2/2', 'battlefield', 0)!)).toEqual([3, 3]);
    expect(tg.pt(tg.bf("Stitcher's Supplier"))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
    expect(tg.pt(tg.find('Zombie 2/2', 'battlefield', 1)!)).toEqual([2, 2]);
  });
  it('exila carta de criatura artefato do cemitério de um oponente e cria um Zombie 2/2 (que recebe +1/+1)', () => {
    const tg = setup({ battlefield: [['Cemetery Reaper', 'Swamp', 'Swamp', 'Swamp'], []], graveyard: [[], ['Razorlash Transmogrant', 'Island']] });
    tg.choose('carta de criatura alvo', ['Razorlash Transmogrant']).activate('Cemetery Reaper').resolve();
    expect(tg.names(1, 'exile')).toEqual(['Razorlash Transmogrant']);
    expect(tg.names(1, 'graveyard')).toEqual(['Island']);
    expect(tg.pt(tg.bf('Zombie 2/2'))).toEqual([3, 3]);
  });
  it('CR 608.2b: se a carta saiu do cemitério, não resolve e não cria a ficha', () => {
    const tg = setup({ battlefield: [['Cemetery Reaper', 'Swamp', 'Swamp', 'Swamp'], []], graveyard: [['Wall of Omens'], []] });
    tg.activate('Cemetery Reaper');
    tg.run(exile(tg.g, [tg.find('Wall of Omens', 'graveyard')!]));
    tg.resolve();
    expect(tg.all('Zombie 2/2').length).toBe(0);
  });
  it('não pode ser ativada sem carta de criatura em algum cemitério', () => {
    const tg = setup({ battlefield: [['Cemetery Reaper', 'Swamp', 'Swamp', 'Swamp'], []], graveyard: [['Island', 'Withering Torment'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});
