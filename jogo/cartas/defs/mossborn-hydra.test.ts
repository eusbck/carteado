import { describe, expect, it } from 'vitest';
import { addCounters, hasKw, putOntoBattlefield } from '../../motor/api.ts';
import { enterCard, fixture, runEffect } from '../../testes/artefatos.ts';

const N = 'Mossborn Hydra';

describe(N, () => {
  it('entra com um marcador +1/+1 e tem atropelar', () => {
    const tg = fixture({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1);
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(true);
  });

  it('dobra os marcadores atuais na resolução de cada aterragem', () => {
    const tg = fixture({ battlefield: [[{ name: N, counters: { '+1/+1': 1 } }], []], hand: [['Forest'], []] });
    const hidra = tg.bf(N);
    tg.play('Forest');
    addCounters(tg.g, { kind: 'obj', id: hidra }, '+1/+1', 2, 0);
    tg.resolveAll();
    expect(tg.pt(hidra)).toEqual([6, 6]);
    enterCard(tg, 'Plains', 0);
    tg.resolveAll();
    expect(tg.pt(hidra)).toEqual([12, 12]);
    enterCard(tg, 'Island', 1);
    tg.resolveAll();
    expect(tg.pt(hidra)).toEqual([12, 12]);
  });

  it('CR 701.10e: dobrar coloca novos marcadores e aplica as substituições', () => {
    const tg = fixture({ battlefield: [[{ name: N, counters: { '+1/+1': 2 } }, 'Corpsejack Menace'], []], hand: [['Forest'], []] });
    tg.play('Forest').resolveAll();
    // Dois existentes + (dois novos dobrados pelo Corpsejack), não simplesmente quatro.
    expect(tg.pt(tg.bf(N))).toEqual([6, 6]);
  });

  it('dispara por cada terreno que entra ao mesmo tempo que ela', () => {
    const tg = fixture({ hand: [[N, 'Forest', 'Plains'], []] });
    runEffect(tg, putOntoBattlefield(tg.g, [
      { id: tg.find(N, 'hand')!, controller: 0 },
      { id: tg.find('Forest', 'hand')!, controller: 0 },
      { id: tg.find('Plains', 'hand')!, controller: 0 },
    ], 'effect'));
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
  });
});
