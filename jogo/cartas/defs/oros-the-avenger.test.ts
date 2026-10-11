import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Oros, the Avenger';

describe(N, () => {
  it('voar; causando dano de combate a um jogador, você pode pagar {2}{W} para causar 3 de dano a cada criatura que não é branca', () => {
    // Indomitable Ancients é branca; Elvish Mystic (verde) e Silver Myr (incolor) não
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Plains', 'Elvish Mystic'], ['Indomitable Ancients', 'Silver Myr']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([6, 6]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.yes('Pagar {2}{W}', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(34);
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(0);
    // Oros é branco, preto e vermelho: branco, não leva dano
    expect(tg.state.objects[id].damage).toBe(0);
  });

  it('sem pagar, nada acontece', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Plains'], ['Silver Myr']] });
    tg.yes('Pagar {2}{W}', false);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.find('Silver Myr')).not.toBeNull();
  });
});