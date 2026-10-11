import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Aerial Extortionist';
const planicies = Array(5).fill('Plains');

describe(N, () => {
  it('entrando, exila até uma permanente que não é terreno; o dono pode conjurá-la do exílio, e você compra uma carta quando ele conjura', () => {
    const tg = setup({ battlefield: [planicies, ['Sol Ring', 'Island']], hand: [[N], []] });
    tg.choose('alvo', ['Sol Ring']).cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 3]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    const carta = tg.find('Sol Ring', 'exile')!;
    expect(carta).not.toBeNull();
    // você não pode conjurar a carta do oponente
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.split(':').includes(String(carta)))).toBe(false);
    tg.passTo('main1', 1);
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(carta)))!;
    expect(acao).toBeDefined();
    const mao = tg.names(0, 'hand').length;
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Sol Ring')].controller).toBe(1);
    expect(tg.names(0, 'hand')).toHaveLength(mao + 1);
  });

  it('causando dano de combate a um jogador, exila de novo; o alvo é opcional', () => {
    const tg = setup({ battlefield: [[N], ['Sol Ring']] });
    tg.choose('alvo', ['Sol Ring']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.find('Sol Ring', 'exile')).not.toBeNull();
    const sem = setup({ battlefield: [[N], ['Sol Ring']] });
    sem.choose('alvo', []);
    sem.attack([[N, 1]]).passTo('main2', 0);
    expect(sem.find('Sol Ring')).not.toBeNull();
  });

  it('mágica conjurada da mão por outro jogador não faz você comprar', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Island']], hand: [[], ['Sol Ring']] });
    tg.cast('Sol Ring').resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(0);
  });
});
