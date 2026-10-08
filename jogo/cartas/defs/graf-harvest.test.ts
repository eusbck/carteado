import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/api.ts';

describe('Graf Harvest', () => {
  it('os Zombies que você controla têm ameaça; os dos oponentes e os não Zombies não', () => {
    const tg = setup({ battlefield: [['Graf Harvest', "Stitcher's Supplier", 'Wall of Omens', { name: 'Zombie 2/2', token: true }], ["Stitcher's Supplier"]] });
    expect(hasKw(tg.g, tg.bf("Stitcher's Supplier", 0), 'menace')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Zombie 2/2'), 'menace')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'menace')).toBe(false);
    expect(hasKw(tg.g, tg.bf("Stitcher's Supplier", 1), 'menace')).toBe(false);
  });
  it('Zombie com ameaça não pode ser bloqueado por uma só criatura', () => {
    const tg = setup({ battlefield: [['Graf Harvest', { name: 'Zombie 2/2', token: true }], ['Wall of Omens']] });
    tg.attack([['Zombie 2/2', 1]]).block([['Wall of Omens', 'Zombie 2/2']]);
    expect(() => tg.passTo('combatDamage')).toThrow(/menace/);
  });
  it('{3}{B}, exilar uma carta de criatura do cemitério: cria um Zombie 2/2', () => {
    const tg = setup({ battlefield: [['Graf Harvest', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []], graveyard: [['Island', 'Wall of Omens'], []] });
    tg.activate('Graf Harvest').resolve();
    expect(tg.all('Zombie 2/2').length).toBe(1);
    expect(tg.names(0, 'exile')).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
  });
  it('sem carta de criatura no cemitério, não pode ativar', () => {
    const tg = setup({ battlefield: [['Graf Harvest', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []], graveyard: [['Island'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});
