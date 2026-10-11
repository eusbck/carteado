import { describe, expect, it } from 'vitest';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Skyclave Apparition';
const planicies = ['Plains', 'Plains', 'Plains'];

describe(N, () => {
  it('exila uma permanente de valor de mana 4 ou menos que você não controla; saindo do campo, o dono cria uma Illusion X/X', () => {
    // Indomitable Ancients tem valor de mana 4
    const tg = setup({ battlefield: [planicies, ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('permanente alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    const ficha = tg.bf('Illusion');
    expect(tg.state.objects[ficha].controller).toBe(1);
    expect(tg.pt(ficha)).toEqual([4, 4]);
    // a carta continua exilada
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
  });

  it('não pode mirar terreno, ficha, permanente sua nem valor de mana 5 ou mais', () => {
    // Zetalpa tem valor de mana 8
    const tg = setup({ battlefield: [[...planicies, 'Sol Ring'], ['Zetalpa, Primal Dawn', 'Island', 'Silver Myr']], hand: [[N], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('permanente alvo')) return null;
      expect(d.items.filter((i) => !i.disabled).map((i) => i.label)).toEqual(['Silver Myr']);
      return { kind: 'select', ids: [] };
    });
    tg.cast(N).resolveAll();
    expect(tg.find('Silver Myr')).not.toBeNull();
  });

  it('sem carta exilada, ninguém cria ficha quando ela sai do campo', () => {
    const tg = setup({ battlefield: [planicies, []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    expect(tg.find('Illusion')).toBeNull();
  });
});
