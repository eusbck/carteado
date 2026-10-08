import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Bastion of Remembrance', () => {
  it('ao entrar, cria um Human Soldier 1/1; quando ele morre, drena 1 de cada oponente', () => {
    const tg = setup({ players: 3, battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], [], []], hand: [['Bastion of Remembrance', 'Infernal Grasp'], [], []] });
    tg.cast('Bastion of Remembrance').resolve().resolve();
    expect(tg.pt(tg.bf('Human Soldier'))).toEqual([1, 1]);
    tg.choose('criatura alvo', ['Human Soldier']).cast('Infernal Grasp').resolve().resolve();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([39, 39, 39]); // -2 do Grasp, +1
  });
  it('CR 603.10a: se sai do campo junto com as criaturas, dispara para cada uma', () => {
    const terrenos = ['Mountain', 'Mountain', 'Plains', 'Plains', 'Plains', 'Swamp', 'Swamp'];
    const tg = setup({ active: 1, battlefield: [['Bastion of Remembrance', 'Elvish Mystic', 'Wall of Omens'], terrenos], hand: [[], ['Ruinous Ultimatum']] });
    tg.cast('Ruinous Ultimatum').resolve().resolveAll();
    expect(tg.find('Bastion of Remembrance')).toBeNull();
    expect(tg.life(1)).toBe(38);
    expect(tg.life(0)).toBe(42);
  });
});
