import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Phyrexian Metamorph';
const ilhas = ['Island', 'Island', 'Island', 'Island'];

describe(N, () => {
  it('copia uma criatura e é artefato além dos tipos dela, sem marcadores', () => {
    const tg = setup({ battlefield: [ilhas, [{ name: 'Spellseeker', counters: { '+1/+1': 2 } }]], hand: [[N], []] });
    tg.choose('entrar como cópia', ['Spellseeker']).cast(N).resolveAll();
    const copias = tg.all('Spellseeker');
    expect(copias).toHaveLength(2);
    const minha = copias.find((id) => tg.state.objects[id].controller === 0)!;
    expect(chars(tg.g, minha).types).toEqual(expect.arrayContaining(['Artifact', 'Creature']));
    expect(tg.pt(minha)).toEqual([1, 1]);
  });
  it('copiando um artefato que não é criatura, deixa de ser criatura', () => {
    const tg = setup({ battlefield: [ilhas, ['Sol Ring']], hand: [[N], []] });
    tg.choose('entrar como cópia', ['Sol Ring']).cast(N).resolveAll();
    const minha = tg.all('Sol Ring').find((id) => tg.state.objects[id].controller === 0)!;
    expect(chars(tg.g, minha).types).toEqual(['Artifact']);
  });
  it('sem copiar nada, entra como 0/0 e morre', () => {
    const tg = setup({ battlefield: [ilhas, ['Sol Ring']], hand: [[N], []] });
    tg.choose('entrar como cópia', ['Não copiar']).cast(N).resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});
