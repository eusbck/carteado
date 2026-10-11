import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Parapet Thrasher';
const DESTRUIR = 'Destrua o artefato alvo que esse oponente controla';
const DANO = 'Esta criatura causa 4 de dano a cada outro oponente';
const EXILAR = 'Exile a carta do topo do seu grimório. Você pode jogá-la neste turno';
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('um ou mais Dragons causando dano de combate a um oponente: um gatilho só; o primeiro modo destrói um artefato desse oponente', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Rapacious Dragon'], ['Sol Ring'], ['Sol Ring']], library: [forests, forests, forests] });
    let alvos: number[] = [];
    tg.choose('modo', [DESTRUIR]);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('artefato alvo')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.obj!);
      return { kind: 'select', ids: [d.items.find((i) => !i.disabled)!.id] };
    });
    tg.attack([[N, 1], ['Rapacious Dragon', 1]]).passTo('main2');
    // só o artefato do oponente que sofreu o dano pode ser alvo
    expect(alvos).toHaveLength(1);
    expect(tg.find('Sol Ring', 'battlefield', 1)).toBeNull();
    expect(tg.find('Sol Ring', 'battlefield', 2)).not.toBeNull();
    // dois Dragons no mesmo oponente dispararam uma vez só: 4 + 3 de combate, sem os 4 do segundo modo
    expect([tg.life(1), tg.life(2)]).toEqual([33, 40]);
  });

  it('cada modo só pode ser escolhido uma vez por turno; sem modo disponível, o gatilho não faz nada', () => {
    // sem artefatos nos oponentes, o primeiro modo não tem alvo: sobram dois modos para dois gatilhos
    const tg = setup({ players: 3, battlefield: [[N, 'Rapacious Dragon'], [], []], library: [['Sol Ring', ...forests], forests, forests] });
    const vistos: string[][] = [];
    for (const modo of [DANO, EXILAR]) {
      tg.script.push((d) => {
        if (d.kind !== 'select' || !d.prompt.includes('modo')) return null;
        vistos.push(d.items.filter((i) => !i.disabled).map((i) => i.label));
        return { kind: 'select', ids: [d.items.find((i) => i.label === modo)!.id] };
      });
    }
    // Thrasher em Bruno, Rapacious Dragon em Carla: dois gatilhos no mesmo dano de combate
    tg.attack([[N, 1], ['Rapacious Dragon', 2]]).passTo('main2');
    expect(vistos).toEqual([[DANO, EXILAR], [EXILAR]]);
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring']);
    // o primeiro gatilho a escolher o modo do dano vale para um dos oponentes: 4 a mais no outro
    const dano = [40 - tg.life(1), 40 - tg.life(2)];
    expect(dano.reduce((a, b) => a + b, 0)).toBe(4 + 3 + 4);
  });

  it('o terceiro modo exila o topo, que pode ser jogado neste turno pagando o custo', () => {
    const tg = setup({ battlefield: [[N, 'Mountain'], []], library: [['Sol Ring', ...forests], forests] });
    tg.choose('modo', [EXILAR]).attack([[N, 1]]).passTo('main2');
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring']);
    tg.cast('Sol Ring', '*').resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(true);
  });

  it('no turno seguinte os modos voltam a poder ser escolhidos; dano de quem não é Dragon não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients'], []], library: [['Sol Ring', 'Island', ...forests], forests] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('main2');
    expect(tg.names(0, 'exile')).toEqual([]);
    tg.passTo('main1', 1);
    tg.choose('modo', [EXILAR]).attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'exile')).toHaveLength(1);
    tg.passTo('main1', 1);
    tg.choose('modo', [EXILAR]).attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'exile')).toHaveLength(2);
  });
});
