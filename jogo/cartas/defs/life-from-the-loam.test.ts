import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import type { Decision } from '../../motor/types.ts';

const N = 'Life from the Loam';
const LIB = ['Hex', 'Hex', 'Hex', 'Sol Ring', 'Sol Ring', 'Sol Ring', 'Island'];
type TG = ReturnType<typeof setup>;
const ehDragar = (d: Decision) => d.kind === 'select' && d.prompt.startsWith('Dragar');

/** responde às próximas perguntas de dragar: 'sim' escolhe a primeira carta oferecida, 'não' recusa */
function dragar(tg: TG, respostas: ('sim' | 'não')[], ofertas: number[] = []): void {
  for (const r of respostas) {
    tg.script.push((d) => {
      if (!ehDragar(d) || d.kind !== 'select') return null;
      ofertas.push(d.items.length);
      return { kind: 'select', ids: r === 'sim' ? [d.items[0].id] : [] };
    });
  }
}

describe(N, () => {
  it('devolve até três cartas de terreno alvo do seu cemitério para a mão', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []], graveyard: [['Island', 'Swamp', 'Mountain', 'Plains', 'Sol Ring'], []] });
    tg.choose('até três cartas de terreno', ['Island', 'Swamp', 'Mountain']).cast(N).resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', 'Mountain', 'Swamp']);
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Plains', 'Sol Ring'].sort());
  });

  it('dragar substitui qualquer compra, não só a da etapa de compra', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], graveyard: [[N], []], library: [LIB, []] });
    const ofertas: number[] = [];
    dragar(tg, ['sim'], ofertas);
    tg.cast("Night's Whisper").resolve();
    // a primeira compra moeu três cartas e devolveu o Loam; na segunda ele já está na mão: compra normal
    expect(ofertas).toEqual([1]);
    expect(tg.names(0, 'hand').sort()).toEqual([N, 'Sol Ring'].sort());
    expect(tg.names(0, 'graveyard').filter((n) => n === 'Hex').length).toBe(3);
  });

  it('dragar na etapa de compra, e recusar mantém a compra normal', () => {
    const tg = setup({ graveyard: [[N], []], library: [LIB, []], step: 'upkeep' });
    dragar(tg, ['não']);
    tg.passTo('main1');
    expect(tg.names(0, 'hand')).toEqual(['Hex']);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });

  it('comprando duas, cada compra é perguntada à parte e a carta dragada pode dragar de novo', () => {
    // a primeira dragagem moe outro Loam, que draga a segunda compra
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], graveyard: [[N], []], library: [[N, 'Hex', 'Hex', 'Sol Ring', 'Sol Ring', 'Sol Ring', 'Island'], []] });
    const ofertas: number[] = [];
    dragar(tg, ['sim', 'sim'], ofertas);
    tg.cast("Night's Whisper").resolve();
    expect(ofertas).toEqual([1, 1]);
    expect(tg.names(0, 'hand')).toEqual([N, N]);
    expect(tg.names(0, 'library')).toEqual(['Island']);
  });

  it('com duas cartas com dragar, uma compra só é substituída por uma delas', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], graveyard: [[N, N], []], library: [LIB, []] });
    const ofertas: number[] = [];
    dragar(tg, ['sim', 'sim'], ofertas);
    tg.cast("Night's Whisper").resolve();
    // uma pergunta por compra, com as duas cartas oferecidas na primeira e a que sobrou na segunda
    expect(ofertas).toEqual([2, 1]);
    expect(tg.names(0, 'hand')).toEqual([N, N]);
    expect(tg.names(0, 'library')).toEqual(['Island']);
  });

  it('com menos de três cartas no grimório, não dá para dragar', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], graveyard: [[N], []], library: [['Hex', 'Island'], []] });
    const ofertas: number[] = [];
    dragar(tg, ['sim'], ofertas);
    tg.cast("Night's Whisper").resolve();
    expect(ofertas).toEqual([]);
    expect(tg.names(0, 'hand').sort()).toEqual(['Hex', 'Island']);
  });
});
