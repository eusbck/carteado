import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Yuriko, Hope from the Shadows';

describe(N, () => {
  it('modo 1: a criatura alvo recebe -X/-0, X = cartas no seu cemitério', () => {
    const tg = setup({ battlefield: [['Island'], ['Indomitable Ancients']], hand: [[N], []], graveyard: [['Forest', 'Island'], []] });
    tg.choose('escolha 1 modo', ['A criatura alvo recebe -X/-0 até o fim do turno, onde X é o número de cartas no seu cemitério']);
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([0, 10]);
  });
  it('modo 2: vigiar 2', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [[N], []], library: [['Forest', 'Swamp', 'Plains'], []] });
    tg.choose('escolha 1 modo', ['Vigiar 2']);
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'graveyard'])), order: d.items.map((i) => i.id) } : null));
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Forest', 'Swamp']);
    expect(tg.names(0, 'library')).toEqual(['Plains']);
  });
});
