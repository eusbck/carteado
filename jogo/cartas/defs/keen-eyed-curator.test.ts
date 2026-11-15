import { describe, expect, it } from 'vitest';
import { hasKw, putOntoBattlefield, returnToHand } from '../../motor/api.ts';
import { fixture, runEffect } from '../../testes/artefatos.ts';

const N = 'Keen-Eyed Curator';
const florestas = Array(6).fill('Forest');

describe(N, () => {
  it('CR 205.2a: conta tipos de carta distintos, inclusive dois de uma carta, sem supertipos ou subtipos', () => {
    const tg = fixture({ battlefield: [[N, ...florestas], []], graveyard: [['Ornithopter', 'Arasta of the Endless Web'], ['Forest']] });
    tg.choose('carta alvo de um cemitério', ['Ornithopter']).activate(N).resolveAll();
    // Artefato + criatura: Thopter não é tipo de carta.
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    tg.choose('carta alvo de um cemitério', ['Arasta of the Endless Web']).activate(N).resolveAll();
    // Encantamento é o terceiro tipo; lendário, Spider e os subtipos anteriores não contam.
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(false);
    tg.choose('carta alvo de um cemitério', ['Forest']).activate(N).resolveAll();
    expect(tg.find('Forest', 'graveyard', 1)).toBeNull();
    expect(tg.pt(tg.bf(N))).toEqual([7, 7]);
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(true);
  });

  it('várias cartas do mesmo tipo não contam como tipos adicionais', () => {
    const tg = fixture({ battlefield: [[N, ...florestas], []], graveyard: [['Forest', 'Plains', 'Island', 'Mountain'], []] });
    for (const carta of ['Forest', 'Plains', 'Island', 'Mountain']) tg.choose('carta alvo de um cemitério', [carta]).activate(N).resolveAll();
    expect(tg.names(0, 'exile')).toHaveLength(4);
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(false);
  });

  it('CR 607.2a: cada Curator considera apenas as cartas que ele próprio exilou', () => {
    const tg = fixture({ battlefield: [[N, N, ...florestas], []], graveyard: [['Ornithopter', 'Forest', 'Rampant Growth'], []], exile: [['Swords to Plowshares'], []] });
    const [primeiro, segundo] = tg.all(N);
    for (const carta of ['Ornithopter', 'Forest', 'Rampant Growth']) tg.choose('carta alvo de um cemitério', [carta]).activate(N).resolveAll();
    expect(tg.pt(primeiro)).toEqual([7, 7]);
    expect(tg.pt(segundo)).toEqual([3, 3]);
    expect(hasKw(tg.g, segundo, 'trample')).toBe(false);
  });

  it('o bônus desaparece se os tipos das cartas ainda exiladas ficarem abaixo de quatro', () => {
    const tg = fixture({ battlefield: [[N, ...florestas], []], graveyard: [['Ornithopter', 'Forest', 'Rampant Growth'], []] });
    for (const carta of ['Ornithopter', 'Forest', 'Rampant Growth']) tg.choose('carta alvo de um cemitério', [carta]).activate(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([7, 7]);
    runEffect(tg, returnToHand(tg.g, [tg.find('Forest', 'exile')!]));
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(false);
  });

  it('CR 400.7: sair e voltar ao campo perde o vínculo, sem devolver as cartas exiladas', () => {
    const tg = fixture({ battlefield: [[N, ...florestas], []], graveyard: [['Ornithopter', 'Forest', 'Rampant Growth'], []] });
    for (const carta of ['Ornithopter', 'Forest', 'Rampant Growth']) tg.choose('carta alvo de um cemitério', [carta]).activate(N).resolveAll();
    const antigo = tg.bf(N);
    runEffect(tg, returnToHand(tg.g, [antigo]));
    runEffect(tg, putOntoBattlefield(tg.g, [{ id: tg.find(N, 'hand')!, controller: 0 }], 'effect'));
    expect(tg.bf(N)).not.toBe(antigo);
    expect(tg.names(0, 'exile')).toHaveLength(3);
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(false);
  });

  it('CR 608.2b: não exila se a carta alvo tiver deixado o cemitério', () => {
    const tg = fixture({ battlefield: [[N, 'Forest'], []], graveyard: [[], ['Ornithopter']] });
    tg.choose('carta alvo de um cemitério', ['Ornithopter']).activate(N);
    runEffect(tg, returnToHand(tg.g, [tg.find('Ornithopter', 'graveyard', 1)!]));
    tg.resolveAll();
    expect(tg.find('Ornithopter', 'exile')).toBeNull();
    expect(tg.find('Ornithopter', 'hand', 1)).not.toBeNull();
  });

  it('a habilidade na pilha ainda exila a carta se o Curator sair do campo', () => {
    const tg = fixture({ battlefield: [[N, 'Forest'], []], graveyard: [[], ['Ornithopter']] });
    tg.choose('carta alvo de um cemitério', ['Ornithopter']).activate(N);
    runEffect(tg, returnToHand(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.find('Ornithopter', 'exile', 1)).not.toBeNull();
    expect(tg.find(N)).toBeNull();
  });
});
