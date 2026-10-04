import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Fleshbag Marauder', () => {
  it('CR 101.4: cada jogador escolhe em ordem APNAP e todos sacrificam juntos', () => {
    const tg = setup({ players: 3, battlefield: [['Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ['Indomitable Ancients', 'Elvish Mystic'], []], hand: [['Fleshbag Marauder'], [], []] });
    const ordem: number[] = [];
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Sacrifique')) { ordem.push(d.player); return { kind: 'select', ids: [d.items.find((i) => i.label === 'Wall of Omens')!.id] }; } return null; });
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Sacrifique')) { ordem.push(d.player); return { kind: 'select', ids: [d.items.find((i) => i.label === 'Elvish Mystic')!.id] }; } return null; });
    tg.cast('Fleshbag Marauder').resolve().resolve();
    expect(ordem).toEqual([0, 1]);
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
  });
  it('sem outra criatura, você sacrifica o próprio Fleshbag Marauder', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [['Fleshbag Marauder'], []] });
    tg.cast('Fleshbag Marauder').resolve().resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Fleshbag Marauder']);
  });
});
