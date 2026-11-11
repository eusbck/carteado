import { describe, expect, it } from 'vitest';
import { manaValue, mayCastFree } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = "Cloud's Limit Break";
const CORTE = 'Corte Cruzado — {0} — Destrua a criatura virada alvo';
const RAIO = 'Raio da Lâmina — {1} — Destrua qualquer número de criaturas viradas alvo com controladores diferentes';
const OMNI = 'Omnicorte — {3}{W} — Destrua todas as criaturas viradas';

type TG = ReturnType<typeof setup>;
const viradas = (tg: TG) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Plains' && tg.state.objects[id].tapped).length;
const planicies = (n: number) => Array(n).fill('Plains');

describe(N, () => {
  it('cada modo cobra o próprio custo adicional: Corte Cruzado {0}, Raio da Lâmina {1}, Omnicorte {3}{W}', () => {
    // Corte Cruzado: só {1}{W}
    const a = setup({ battlefield: [[...planicies(6)], [{ name: 'Serra Angel', tapped: true }, 'Indomitable Ancients']], hand: [[N], []] });
    a.choose('modo', [CORTE]).choose('criatura virada alvo', ['Serra Angel']).cast(N).resolve();
    expect(a.find('Serra Angel', 'graveyard')).not.toBeNull();
    expect(a.bf('Indomitable Ancients')).not.toBeNull();
    expect(viradas(a)).toBe(2);

    // Omnicorte: {1}{W} + {3}{W}; destrói todas as viradas, inclusive as suas, e deixa as desviradas
    const b = setup({
      battlefield: [[...planicies(6), { name: 'Silver Myr', tapped: true }, 'Elvish Mystic'], [{ name: 'Serra Angel', tapped: true }, 'Indomitable Ancients']],
      hand: [[N], []],
    });
    b.choose('modo', [OMNI]).cast(N).resolve();
    expect(viradas(b)).toBe(6);
    expect(b.find('Silver Myr', 'graveyard')).not.toBeNull();
    expect(b.find('Serra Angel', 'graveyard')).not.toBeNull();
    expect(b.bf('Elvish Mystic')).not.toBeNull();
    expect(b.bf('Indomitable Ancients')).not.toBeNull();
  });

  it('Raio da Lâmina: {1} a mais; destrói as criaturas viradas alvo, uma de cada controlador', () => {
    const tg = setup({
      players: 3,
      battlefield: [[...planicies(4)], [{ name: 'Serra Angel', tapped: true }, { name: 'Silver Myr', tapped: true }], [{ name: 'Elvish Mystic', tapped: true }]],
      hand: [[N], [], []],
    });
    tg.choose('modo', [RAIO]).choose('controladores diferentes', ['Serra Angel', 'Elvish Mystic']).cast(N);
    expect(viradas(tg)).toBe(3);
    tg.resolve();
    expect(tg.find('Serra Angel', 'graveyard')).not.toBeNull();
    expect(tg.find('Elvish Mystic', 'graveyard')).not.toBeNull();
    expect(tg.bf('Silver Myr')).not.toBeNull();
  });

  it('Raio da Lâmina não aceita duas criaturas do mesmo controlador', () => {
    const tg = setup({
      battlefield: [[...planicies(4)], [{ name: 'Serra Angel', tapped: true }, { name: 'Silver Myr', tapped: true }]],
      hand: [[N], []],
    });
    tg.choose('modo', [RAIO]).choose('controladores diferentes', ['Serra Angel', 'Silver Myr']);
    expect(() => tg.cast(N)).toThrow(/combinação de alvos não é permitida/);
  });

  it('o modo com alvo só pode ser escolhido se houver uma criatura virada; os outros não exigem alvo', () => {
    const tg = setup({ battlefield: [[...planicies(6)], ['Indomitable Ancients']], hand: [[N], []] });
    let itens: { label: string; disabled?: boolean }[] = [];
    tg.script.push((d) => {
      if (!d.prompt.includes('modo') || !('items' in d)) return null;
      itens = (d as { items: { label: string; disabled?: boolean }[] }).items;
      return null;
    });
    tg.choose('modo', [OMNI]).cast(N).resolve();
    expect(itens.find((i) => i.label === CORTE)?.disabled).toBe(true);
    expect(itens.find((i) => i.label === RAIO)?.disabled).toBeFalsy();
    expect(itens.find((i) => i.label === OMNI)?.disabled).toBeFalsy();
    expect(tg.bf('Indomitable Ancients')).not.toBeNull();
  });

  it('o valor de mana continua 2, qualquer que seja o modo', () => {
    const tg = setup({ battlefield: [[...planicies(6)], []], hand: [[N], []] });
    tg.choose('modo', [OMNI]).cast(N);
    const pilha = tg.state.zones.stack;
    expect(manaValue(tg.g, pilha[pilha.length - 1])).toBe(2);
  });

  it('conjurada sem pagar o custo de mana, ainda paga o custo do modo escolhido', () => {
    const tg = setup({ battlefield: [['Plains'], [{ name: 'Serra Angel', tapped: true }, { name: 'Silver Myr', tapped: true }]], hand: [[N], []] });
    tg.yes('sem pagar', true).choose('modo', [RAIO]).choose('controladores diferentes', ['Serra Angel']);
    runEffect(tg, mayCastFree(tg.g, 0, tg.find(N, 'hand', 0)!));
    expect(viradas(tg)).toBe(1);
    tg.resolve();
    expect(tg.find('Serra Angel', 'graveyard')).not.toBeNull();
    expect(tg.bf('Silver Myr')).not.toBeNull();
  });
});
