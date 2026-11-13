import { describe, expect, it } from 'vitest';
import { chars, kwParams } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Crystal Spray';
const ilhas = ['Island', 'Island', 'Island'];

describe(N, () => {
  it('num Forest, Forest vira Island na linha de tipo e ele passa a produzir {U}; acaba no fim do turno', () => {
    const tg = setup({ battlefield: [ilhas, ['Forest']], hand: [[N], []], library: [['Opt'], ['Swamp']] });
    let novas: string[] = [];
    tg.choose('mágica ou permanente alvo', ['Forest']).choose('trocar uma palavra de cor', ['Tipo básico de terreno']).choose('palavra que vai ser trocada', ['Forest (floresta)']);
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('palavra nova')) { novas = d.items.map((i) => i.label); return { kind: 'select', ids: ['Island'] }; } return null; });
    tg.cast(N).resolve();
    const f = tg.bf('Forest');
    expect(novas).not.toContain('Forest (floresta)');
    expect(chars(tg.g, f).subtypes).toEqual(['Island']);
    expect(chars(tg.g, f).abilities.map((a) => a.id)).toEqual(['basic:U']);
    expect(tg.names(0, 'hand')).toEqual(['Opt']);
    tg.passTo('upkeep', 1);
    expect(chars(tg.g, f).subtypes).toEqual(['Forest']);
  });
  it('as palavras são escolhidas na resolução; a troca de cor muda a proteção', () => {
    const tg = setup({ battlefield: [ilhas, ['Karmic Guide']], hand: [[N], []], library: [['Opt'], []] });
    tg.choose('mágica ou permanente alvo', ['Karmic Guide']).cast(N);
    // ainda na pilha: nenhuma pergunta de palavra até resolver
    expect(kwParams(tg.g, tg.bf('Karmic Guide'), 'protection')).toEqual(['color:B']);
    tg.choose('trocar uma palavra de cor', ['Palavra de cor']).choose('palavra que vai ser trocada', ['preto']).choose('palavra nova', ['azul']).resolve();
    expect(kwParams(tg.g, tg.bf('Karmic Guide'), 'protection')).toEqual(['color:U']);
  });
  it('a troca na mágica de criatura continua no permanente em que ela vira', () => {
    const tg = setup({ active: 1, battlefield: [ilhas, Array(5).fill('Plains')], hand: [[N], ['Karmic Guide']], library: [['Opt'], []] });
    tg.cast('Karmic Guide').pass();
    tg.choose('mágica ou permanente alvo', ['Karmic Guide']).choose('trocar uma palavra de cor', ['Palavra de cor']).choose('palavra que vai ser trocada', ['preto']).choose('palavra nova', ['vermelho']);
    tg.cast(N).resolve().resolveAll();
    expect(kwParams(tg.g, tg.bf('Karmic Guide'), 'protection')).toEqual(['color:R']);
  });
});
