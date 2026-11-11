import { describe, expect, it } from 'vitest';
import { addEffect, controllerOf, destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Gilded Drake';

describe(N, () => {
  it('troca o controle dele e da criatura alvo do oponente', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Spellseeker']], hand: [[N], []] });
    tg.choose('até uma criatura alvo', ['Spellseeker']).cast(N).resolveAll();
    expect(controllerOf(tg.g, tg.bf('Spellseeker'))).toBe(0);
    expect(controllerOf(tg.g, tg.bf(N))).toBe(1);
  });
  it('sem alvo escolhido, sacrifique o Gilded Drake', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Spellseeker']], hand: [[N], []] });
    tg.choose('até uma criatura alvo', []).cast(N).resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
  it('se a criatura escolhida saiu do campo, sacrifique o Gilded Drake', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Spellseeker']], hand: [[N], []] });
    tg.choose('até uma criatura alvo', ['Spellseeker']).cast(N).resolve();
    tg.run(destroy(tg.g, [tg.bf('Spellseeker')]));
    tg.resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
  it('com o alvo ilegal na resolução (proteção), a habilidade resolve e você sacrifica o Gilded Drake', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Spellseeker']], hand: [[N], []] });
    tg.choose('até uma criatura alvo', ['Spellseeker']).cast(N).resolve();
    const alvo = tg.bf('Spellseeker');
    addEffect(tg.g, { source: alvo, sourceDef: '', controller: 1, duration: { kind: 'endOfTurn' }, affected: [alvo], mods: [{ k: 'addKeyword', kw: 'protection', param: 'color:U' }] });
    tg.refresh().resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(controllerOf(tg.g, alvo)).toBe(1);
  });
});
