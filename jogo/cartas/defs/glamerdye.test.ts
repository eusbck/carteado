import { describe, expect, it } from 'vitest';
import { kwParams } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Glamerdye';

describe(N, () => {
  it('troca a cor da proteção de uma criatura, sem prazo', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Malakir Bloodwitch']], hand: [[N], []], library: [[], ['Swamp', 'Swamp']] });
    tg.choose('mágica ou permanente alvo', ['Malakir Bloodwitch']).choose('palavra que vai ser trocada', ['branco']).choose('palavra nova', ['azul']).cast(N).resolve();
    expect(kwParams(tg.g, tg.bf('Malakir Bloodwitch'), 'protection')).toEqual(['color:U']);
    tg.passTo('upkeep', 1);
    expect(kwParams(tg.g, tg.bf('Malakir Bloodwitch'), 'protection')).toEqual(['color:U']);
  });
  it('do cemitério, descartando uma carta de terreno, e volta para o cemitério', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Malakir Bloodwitch']], hand: [['Forest'], []], graveyard: [[N], []] });
    tg.choose('mágica ou permanente alvo', ['Malakir Bloodwitch']).cast(N, 'retrace').resolve();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Forest', N]);
  });
});
