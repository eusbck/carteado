import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Pearl-Ear, Imperial Advisor', () => {
  it('a redução conta cada Aura que você controla; criatura com marcador está modificada', () => {
    const tg = setup({
      battlefield: [['Pearl-Ear, Imperial Advisor', 'Plains', { name: 'Wall of Omens', counters: { oil: 1 } }, { name: 'Angelic Gift', attachTo: 'Pearl-Ear, Imperial Advisor' }, { name: 'Ethereal Armor', attachTo: 'Pearl-Ear, Imperial Advisor' }], []],
      hand: [['Flickering Ward'], []], library: [['Island'], []],
    });
    // Flickering Ward custa {W} — com duas Auras, a afinidade só reduz genérico; paga com uma Plains
    tg.choose('criatura', ['Wall of Omens']).choose('escolha uma cor', ['preto']);
    tg.cast('Flickering Ward').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('criatura sem modificação não faz comprar', () => {
    const tg = setup({ battlefield: [['Pearl-Ear, Imperial Advisor', 'Plains', 'Wall of Omens'], []], hand: [['Flickering Ward'], []], library: [['Island'], []] });
    tg.choose('criatura', ['Wall of Omens']).choose('escolha uma cor', ['preto']);
    tg.cast('Flickering Ward').resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
  it('afinidade: Ghostly Prison com duas Auras custa {W}', () => {
    const tg = setup({
      battlefield: [['Pearl-Ear, Imperial Advisor', 'Plains', { name: 'Angelic Gift', attachTo: 'Pearl-Ear, Imperial Advisor' }, { name: 'Ethereal Armor', attachTo: 'Pearl-Ear, Imperial Advisor' }], []],
      hand: [['Ghostly Prison'], []],
    });
    tg.cast('Ghostly Prison').resolve();
    expect(tg.find('Ghostly Prison')).not.toBeNull();
  });
});
