import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

describe('Nightmare Shepherd', () => {
  it('exila a criatura que morreu e cria uma cópia 1/1 Nightmare, com a habilidade de entrar', () => {
    const tg = setup({
      battlefield: [['Nightmare Shepherd', 'Wall of Omens', 'Burnished Hart', 'Plains', 'Plains', 'Plains', 'Plains', 'Island'], ['Indomitable Ancients']],
      hand: [['Time Wipe'], []], library: [['Island', 'Forest'], []],
    });
    // Shepherd e Wall morrem juntas: o gatilho olha para trás (CR 603.10a) e vê a Wall morrer
    tg.choose('devolver à mão', ['Burnished Hart']).yes('Nightmare Shepherd: exilar', true);
    tg.cast('Time Wipe');
    while (tg.state.zones.stack.length) tg.resolve();
    expect(tg.names(0, 'exile')).toEqual(['Wall of Omens']);
    const ficha = tg.find('Wall of Omens')!;
    expect(ficha).not.toBeNull();
    expect(tg.state.objects[ficha].isToken).toBe(true);
    const c = chars(tg.g, ficha);
    expect([c.power, c.toughness]).toEqual([1, 1]);
    expect(c.subtypes).toEqual(expect.arrayContaining(['Wall', 'Nightmare']));
    // a habilidade de entrar da Wall of Omens disparou: comprou uma carta
    expect(tg.names(0, 'hand')).toEqual(['Burnished Hart', 'Island']);
    // a criatura do oponente não conta
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
  });
});
