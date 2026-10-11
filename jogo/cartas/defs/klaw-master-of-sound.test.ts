import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Klaw, Master of Sound';

describe(N, () => {
  it('toque mortífero; causando dano de combate, exila virado para baixo o topo do grimório do jogador; jogando a carta com qualquer mana, Klaw fica indestrutível', () => {
    // Elvish Mystic custa {G}: com uma Island só dá porque qualquer tipo de mana serve
    const tg = setup({ battlefield: [[N, 'Island'], []], library: [Array(8).fill('Island'), ['Elvish Mystic', ...Array(8).fill('Island')]] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(hasKw(tg.g, id, 'deathtouch')).toBe(true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(37);
    const carta = tg.state.zones.exile[0];
    expect(tg.state.objects[carta].def).toBe('Elvish Mystic');
    expect(tg.state.objects[carta].faceDown).toBe(true);
    expect(tg.state.objects[carta].visibleTo).toEqual([0]);
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(carta)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].controller).toBe(0);
    expect(hasKw(tg.g, id, 'indestructible')).toBe(true);
  });

  it('conjurar da mão não dá indestrutível', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Sol Ring'], []] });
    tg.cast('Sol Ring').resolveAll();
    expect(hasKw(tg.g, tg.bf(N), 'indestructible')).toBe(false);
  });
});
