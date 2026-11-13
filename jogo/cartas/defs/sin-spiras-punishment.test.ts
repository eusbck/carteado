import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = "Sin, Spira's Punishment";
const fichas = (tg: ReturnType<typeof setup>) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].isToken);

describe(N, () => {
  it('a ficha é uma cópia virada da carta exilada (a impressa)', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Island', 'Island', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[N], []], graveyard: [['Indomitable Ancients', 'Hex'], []] });
    tg.cast(N).resolveAll();
    const [f] = fichas(tg);
    expect(tg.state.objects[f].tapped).toBe(true);
    expect(chars(tg.g, f).name).toBe('Indomitable Ancients');
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
    // a mágica (Hex) não é carta de permanente
    expect(tg.find('Hex', 'graveyard')).not.toBeNull();
  });
  it('o gatilho de entrar da carta copiada dispara para a ficha', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Island', 'Island', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[N], []], graveyard: [['Wall of Omens'], []], library: [['Hex'], []] });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Hex']);
  });
  it('se a carta exilada é de terreno, repete até sair uma que não é (ou acabar)', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Island', 'Island', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[N], []], graveyard: [['Strip Mine', 'Field of the Dead', 'Breeding Pool'], []] });
    tg.cast(N).resolveAll();
    // só terrenos: os três viram fichas viradas
    expect(fichas(tg).length).toBe(3);
    expect(tg.state.zones.graveyard[0].length).toBe(0);
    expect(fichas(tg).every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
  it('ao atacar, o processo acontece de novo', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Indomitable Ancients'], []] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(fichas(tg).length).toBe(1);
  });
  it('sem carta de permanente no cemitério, nada acontece', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Island', 'Island', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[N], []], graveyard: [['Hex'], []] });
    tg.cast(N).resolveAll();
    expect(fichas(tg).length).toBe(0);
  });
});
