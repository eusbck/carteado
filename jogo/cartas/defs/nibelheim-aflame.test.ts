import { describe, expect, it } from 'vitest';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Nibelheim Aflame';
const montanhas = (n: number) => Array(n).fill('Mountain');
const dano = (tg: ReturnType<typeof setup>, nome: string) => tg.state.objects[tg.bf(nome)].damage;

describe(N, () => {
  it('a criatura alvo causa dano igual à força dela na resolução a cada outra criatura, inclusive as suas', () => {
    const tg = setup({
      battlefield: [[...montanhas(4), 'Serra Angel', 'Elvish Mystic'], ['Indomitable Ancients']],
      hand: [[N, 'Island'], []],
    });
    tg.choose('criatura alvo que você controla', ['Serra Angel']).cast(N).resolve();
    expect(tg.find('Elvish Mystic', 'graveyard')).not.toBeNull();
    expect(dano(tg, 'Indomitable Ancients')).toBe(4);
    expect(dano(tg, 'Serra Angel')).toBe(0);
    // da mão: não descarta nem compra
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.names(0, 'graveyard')).toContain(N);
  });

  it('a criatura é a fonte do dano: uma criatura branca causa dano a uma criatura com proteção contra vermelho', () => {
    // a Akroma tem proteção contra branco: o dano de Serra Angel (branca) é prevenido; o de uma mágica vermelha não seria
    const tg = setup({
      battlefield: [[...montanhas(4), 'Serra Angel'], ['Akroma, Angel of Fury', 'Indomitable Ancients']],
      hand: [[N], []],
    });
    tg.choose('criatura alvo que você controla', ['Serra Angel']).cast(N).resolve();
    expect(dano(tg, 'Akroma, Angel of Fury')).toBe(0);
    expect(dano(tg, 'Indomitable Ancients')).toBe(4);
  });

  it('conjurada do cemitério por retrospectiva, descarta a mão, compra quatro e vai para o exílio', () => {
    const tg = setup({
      battlefield: [[...montanhas(7), 'Serra Angel'], ['Indomitable Ancients']],
      hand: [['Island', 'Swamp'], []], graveyard: [[N], []],
    });
    tg.choose('criatura alvo que você controla', ['Serra Angel']).cast(N, 'flashback').resolve();
    expect(dano(tg, 'Indomitable Ancients')).toBe(4);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Island', 'Swamp']);
    expect(tg.names(0, 'hand')).toEqual(['Forest', 'Forest', 'Forest', 'Forest']);
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Mountain' && tg.state.objects[id].tapped)).toHaveLength(7);
  });

  it('se a criatura alvo fica ilegal, nada acontece, nem o descarte e a compra', () => {
    const tg = setup({
      battlefield: [[...montanhas(7), 'Serra Angel'], ['Indomitable Ancients']],
      hand: [['Island'], []], graveyard: [[N], []],
    });
    tg.choose('criatura alvo que você controla', ['Serra Angel']).cast(N, 'flashback');
    removeCard(tg, tg.bf('Serra Angel'));
    tg.resolve();
    expect(dano(tg, 'Indomitable Ancients')).toBe(0);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    // por retrospectiva, vai para o exílio mesmo sem resolver (ruling 7)
    expect(tg.find(N, 'exile')).not.toBeNull();
  });

  it('não dá para conjurar sem uma criatura sua como alvo', () => {
    const tg = setup({ battlefield: [[...montanhas(4)], ['Indomitable Ancients']], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
  });
});
