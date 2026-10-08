import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const pantanos = Array.from({ length: 7 }, () => 'Swamp');
const Z = { name: 'Zombie 2/2', token: true };

describe('Necrotic Hex', () => {
  it('CR 101.4: cada jogador escolhe em ordem APNAP e todos sacrificam juntos; depois as fichas', () => {
    const tg = setup({
      players: 3,
      battlefield: [[...pantanos, 'Wall of Omens', Z, Z, Z, Z, Z, Z], ['Elvish Mystic', 'Indomitable Ancients'], [Z, Z, Z, Z, Z, Z, Z, 'Midnight Reaper']],
      hand: [['Necrotic Hex'], [], []], library: [[], [], ['Island']],
    });
    const ordem: number[] = [];
    const escolha = (d: Parameters<typeof tg.respond>[0]) => {
      if (d.kind !== 'select' || !d.prompt.includes('Sacrifique')) return null;
      ordem.push(d.player);
      // Ana fica com Wall of Omens; Carla fica com Midnight Reaper
      const fora = d.player === 0 ? 'Wall of Omens' : 'Midnight Reaper';
      return { kind: 'select' as const, ids: d.items.filter((i) => i.label !== fora).slice(0, 6).map((i) => i.id) };
    };
    tg.script.push(escolha, escolha);
    tg.cast('Necrotic Hex').resolve();
    expect(ordem).toEqual([0, 2]);
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.names(1, 'battlefield')).toEqual([]);
    expect(tg.names(2, 'battlefield').sort()).toEqual(['Midnight Reaper', 'Zombie']);
    const fichas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Zombie 2/2' && tg.state.objects[id].controller === 0);
    expect(fichas.length).toBe(6);
    expect(fichas.every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
  it('seis fichas viradas mesmo sem nada para sacrificar', () => {
    const tg = setup({ battlefield: [[...pantanos], []], hand: [['Necrotic Hex'], []] });
    tg.cast('Necrotic Hex').resolve();
    expect(tg.all('Zombie 2/2').length).toBe(6);
    expect(tg.all('Zombie 2/2').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
});
