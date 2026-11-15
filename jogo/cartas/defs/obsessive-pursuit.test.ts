import { describe, expect, it } from 'vitest';
import { hasKw, sacrifice } from '../../motor/api.ts';
import { enterCard, fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Obsessive Pursuit';

describe(N, () => {
  it('ao entrar cria uma Pista que pode ser sacrificada por {2} para comprar uma carta', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Sol Ring'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.life(0)).toBe(39);
    expect(tg.all('Clue')).toHaveLength(1);
    tg.activate('Clue').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    expect(tg.find('Clue')).toBeNull();
  });
  it('dispara só na sua manutenção, somando à perda de vida e à Pista da entrada', () => {
    const tg = setup();
    enterCard(tg, N, 0);
    tg.resolveAll().passTo('upkeep', 1).resolveAll();
    expect(tg.life(0)).toBe(39);
    expect(tg.all('Clue')).toHaveLength(1);
    tg.passTo('upkeep', 0).resolveAll();
    expect(tg.life(0)).toBe(38);
    expect(tg.all('Clue')).toHaveLength(2);
  });
  it('cria a Pista diretamente, sem realizar a ação de investigar', () => {
    const tg = setup();
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.all('Clue')).toHaveLength(1);
    expect(tg.state.zones.stack).toHaveLength(0);
    expect(tg.names(0, 'graveyard')).toHaveLength(0);
    expect(tg.state.log.some((linha) => /investiga/i.test(linha.text))).toBe(false);
  });
  it('CR 608.2h: conta sacrifícios anteriores à entrada e feitos em resposta; três dão vínculo com a vida', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', 'Elvish Mystic', 'Sol Ring', { name: 'Treasure', token: true }], []] });
    runEffect(tg, sacrifice(tg.g, [tg.bf('Elvish Mystic'), tg.bf('Sol Ring')]));
    enterCard(tg, N, 0);
    tg.resolveAll();
    tg.choose('criatura atacante alvo', ['Indomitable Ancients']).attack([['Indomitable Ancients', 1]]).passUntil((j) => j.state.zones.stack.length > 0);
    expect(tg.state.zones.stack).toHaveLength(1);
    runEffect(tg, sacrifice(tg.g, [tg.bf('Treasure')]));
    tg.resolveAll();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([5, 13]);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'lifelink')).toBe(true);
    tg.passTo('main1', 1);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'lifelink')).toBe(false);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters['+1/+1']).toBe(3);
  });
  it('atacar com duas criaturas gera um gatilho e põe os marcadores só no alvo; com dois sacrifícios não dá vínculo', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients', 'Elvish Mystic', 'Sol Ring', 'Forest'], ['Sol Ring']] });
    runEffect(tg, sacrifice(tg.g, [tg.bf('Sol Ring', 0), tg.bf('Forest'), tg.bf('Sol Ring', 1)]));
    tg.choose('criatura atacante alvo', ['Elvish Mystic']).attack([['Indomitable Ancients', 1], ['Elvish Mystic', 1]]).passUntil((j) => j.state.zones.stack.length > 0);
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolveAll();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'lifelink')).toBe(false);
  });
  it('com zero sacrifícios o alvo não recebe marcadores nem vínculo com a vida', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []] });
    tg.attack([['Elvish Mystic', 1]]).passTo('declareBlockers').resolveAll();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'lifelink')).toBe(false);
  });
});
