import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Trickery Charm';

describe(N, () => {
  it('modo 1: a criatura alvo ganha voar até o fim do turno', () => {
    const tg = setup({ battlefield: [['Island', 'Memnite'], []], hand: [[N], []] });
    tg.choose('escolha 1 modo', ['A criatura alvo ganha voar até o fim do turno']).choose('criatura alvo', ['Memnite']);
    tg.cast(N).resolve();
    expect(hasKw(tg.g, tg.bf('Memnite'), 'flying')).toBe(true);
  });
  it('CR 205.1b: modo 2: a criatura passa a ser só do tipo escolhido até o fim do turno', () => {
    const tg = setup({ battlefield: [['Island', 'Memnite'], []], hand: [[N], []], library: [['Island', 'Island'], ['Island', 'Island']] });
    tg.choose('escolha 1 modo', ['A criatura alvo passa a ser do tipo de criatura que você escolher até o fim do turno']).choose('criatura alvo', ['Memnite']);
    tg.choose('Trickery Charm: escolha o tipo', ['Ninja']);
    tg.cast(N).resolve();
    const id = tg.bf('Memnite');
    expect(chars(tg.g, id).subtypes).toEqual(['Ninja']);
    expect(chars(tg.g, id).types).toEqual(['Artifact', 'Creature']);
    tg.passTo('main1', 1);
    expect(chars(tg.g, id).subtypes).toEqual(['Construct']);
  });
  it('modo 3: reordena as quatro do topo', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [[N], []], library: [['Island', 'Forest', 'Swamp', 'Plains', 'Mountain'], []] });
    tg.choose('escolha 1 modo', ['Olhe as quatro cartas do topo do seu grimório e coloque-as de volta em qualquer ordem']);
    tg.choose('Trickery Charm: ponha', ['Plains', 'Swamp', 'Forest', 'Island']);
    tg.cast(N).resolve();
    expect(tg.names(0, 'library')).toEqual(['Plains', 'Swamp', 'Forest', 'Island', 'Mountain']);
  });
});
