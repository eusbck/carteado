import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { gainLife, hasKw, loseLife } from '../../motor/api.ts';

describe('Ob Nixilis, the Ascended', () => {
  it('ao entrar, destrói as criaturas viradas dos oponentes e você ganha 1 por criatura destruída; depois cria o Anjo na etapa final', () => {
    const tg = setup({
      players: 3,
      battlefield: [
        [...Array(7).fill('Plains'), { name: 'Elvish Mystic', tapped: true }],
        [{ name: 'Wall of Omens', tapped: true }, 'Indomitable Ancients'],
        [{ name: 'Elvish Mystic', tapped: true }, { name: 'Memnarch, the Warden', tapped: true }, { name: 'Sol Ring', tapped: true }],
      ],
      hand: [['Ob Nixilis, the Ascended'], [], []],
    });
    tg.cast('Ob Nixilis, the Ascended').resolve().resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual(['Indomitable Ancients']); // desvirada fica
    expect(tg.names(2, 'battlefield').sort()).toEqual(['Memnarch, the Warden', 'Sol Ring']); // indestrutível e não criatura ficam
    expect(tg.find('Elvish Mystic', 'battlefield', 0)).not.toBeNull(); // a sua fica
    expect(tg.life(0)).toBe(42);
    tg.passTo('end').resolveAll();
    const anjo = tg.bf('Angel');
    expect(tg.pt(anjo)).toEqual([4, 4]);
    expect(hasKw(tg.g, anjo, 'flying')).toBe(true);
    expect(tg.state.objects[anjo].isToken).toBe(true);
  });

  it('ruling 1 — ganhou 2 e perdeu 4 no turno: ainda cria o Anjo, também na etapa final de um oponente', () => {
    const tg = setup({ active: 1, battlefield: [['Ob Nixilis, the Ascended'], []] });
    gainLife(tg.g, 0, 2, null);
    loseLife(tg.g, 0, 4, null);
    tg.refresh().passTo('end', 1).resolveAll();
    expect(tg.find('Angel', 'battlefield', 0)).not.toBeNull();
  });

  it('sem ganhar vida no turno, não cria nada', () => {
    const tg = setup({ battlefield: [['Ob Nixilis, the Ascended'], []] });
    tg.passTo('end').resolveAll();
    expect(tg.find('Angel')).toBeNull();
    expect(tg.state.zones.stack).toEqual([]);
  });
});
