import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const seis = ['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'];
const naoBasicos = ['Command Tower', 'Reliquary Tower', 'Evolving Wilds', 'Access Tunnel'];

describe('Razorlash Transmogrant', () => {
  it('não pode bloquear', () => {
    const tg = setup({ battlefield: [['Elvish Mystic'], ['Razorlash Transmogrant', 'Indomitable Ancients']] });
    const pode: Record<string, number> = {};
    tg.script.push((d) => {
      if (d.kind !== 'blockers') return null;
      for (const x of d.candidates) pode[tg.state.objects[x.obj].def] = x.canBlock.length;
      return { kind: 'blockers', blocks: [] };
    });
    tg.attack([['Elvish Mystic', 1]]).passTo('combatDamage');
    expect(pode['Indomitable Ancients']).toBe(1);
    expect(pode['Razorlash Transmogrant'] ?? 0).toBe(0);
  });
  it('{4}{B}{B}: volta do cemitério ao campo com um marcador +1/+1', () => {
    const tg = setup({ battlefield: [[...seis], []], graveyard: [['Razorlash Transmogrant'], []] });
    tg.activate('Razorlash Transmogrant').resolve();
    const r = tg.bf('Razorlash Transmogrant');
    expect(tg.state.objects[r].counters['+1/+1']).toBe(1);
    expect(tg.pt(r)).toEqual([4, 2]);
  });
  it('sem a redução, {B}{B} não basta', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Command Tower', 'Reliquary Tower', 'Evolving Wilds', 'Forest']], graveyard: [['Razorlash Transmogrant'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
  it('custa {4} a menos se um oponente controla quatro ou mais terrenos não básicos', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], [...naoBasicos]], graveyard: [['Razorlash Transmogrant'], []] });
    tg.activate('Razorlash Transmogrant').resolve();
    expect(tg.find('Razorlash Transmogrant')).not.toBeNull();
  });
  it('conta por oponente, não a soma entre oponentes', () => {
    const tg = setup({ players: 3, battlefield: [['Swamp', 'Swamp'], ['Command Tower', 'Reliquary Tower'], ['Evolving Wilds', 'Access Tunnel']], graveyard: [['Razorlash Transmogrant'], [], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
  it('só funciona no cemitério', () => {
    const tg = setup({ battlefield: [[...seis, 'Razorlash Transmogrant'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});
