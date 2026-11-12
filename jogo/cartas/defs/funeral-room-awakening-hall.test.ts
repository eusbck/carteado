import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const SALA = 'Funeral Room // Awakening Hall';

describe(SALA, () => {
  it('Funeral Room: cada criatura sua que morre drena 1 de cada oponente', () => {
    const tg = setup({ players: 3, battlefield: [['Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], [], []], hand: [[SALA], [], []] });
    tg.cast(SALA, 'hand').resolve();
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(39);
    expect(tg.life(2)).toBe(39);
    expect(tg.life(0)).toBe(41);
  });

  it('destrancar Awakening Hall devolve todas as cartas de criatura do seu cemitério', () => {
    const tg = setup({ battlefield: [[...Array(8).fill('Swamp')], []], hand: [[SALA], []], graveyard: [['Wall of Omens', 'Indomitable Ancients', 'Sol Ring'], []], library: [['Island'], []] });
    tg.cast(SALA, 'hand@1').resolveAll();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.find('Sol Ring')).toBeNull();
  });
});
