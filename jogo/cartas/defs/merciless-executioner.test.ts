import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Merciless Executioner', () => {
  it('CR 101.4: cada jogador escolhe em ordem APNAP e todos sacrificam juntos', () => {
    const tg = setup({ players: 3, battlefield: [['Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ['Indomitable Ancients', 'Elvish Mystic'], []], hand: [['Merciless Executioner'], [], []] });
    const ordem: number[] = [];
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Sacrifique')) { ordem.push(d.player); return { kind: 'select', ids: [d.items.find((i) => i.label === 'Wall of Omens')!.id] }; } return null; });
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Sacrifique')) { ordem.push(d.player); return { kind: 'select', ids: [d.items.find((i) => i.label === 'Elvish Mystic')!.id] }; } return null; });
    tg.cast('Merciless Executioner').resolve().resolve();
    expect(ordem).toEqual([0, 1]);
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
  });
  it('sem outra criatura, você sacrifica o próprio Merciless Executioner', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [['Merciless Executioner'], []] });
    tg.cast('Merciless Executioner').resolve().resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Merciless Executioner']);
  });
});
