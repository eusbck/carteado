import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

const AW = "Avatar's Wrath";
const PLANICIES = ['Plains', 'Plains', 'Plains', 'Plains'];

describe(AW, () => {
  it('as outras criaturas vão para o exílio e o dono pode conjurá-las por {2}', () => {
    const tg = setup({ battlefield: [[...PLANICIES, 'Elvish Mystic', 'Zetalpa, Primal Dawn'], ['Indomitable Ancients', 'Island', 'Island']], hand: [[AW], []], library: [Array(4).fill('Plains'), Array(4).fill('Island')] });
    tg.choose('até uma criatura alvo', ['Zetalpa, Primal Dawn']).cast(AW).resolve();
    expect(tg.find('Zetalpa, Primal Dawn', 'battlefield', 0)).not.toBeNull();
    expect(tg.find('Elvish Mystic', 'exile', 0)).not.toBeNull();
    const anc = tg.find('Indomitable Ancients', 'exile', 1)!;
    expect(anc).not.toBeNull();
    // a própria mágica vai para o exílio
    expect(tg.find(AW, 'exile', 0)).not.toBeNull();
    // passado o próximo turno de Ana (até lá ele só conjura da mão), Bruno conjura Indomitable Ancients ({2}{W}{W}) por
    // {2} com duas Islands
    tg.passTo('main1', 1);
    expect(tg.actionIds().some((a) => a.startsWith(`cast:${anc}:`))).toBe(false);
    tg.passTo('main1', 0).passTo('main1', 1);
    const acao = tg.actionIds().find((a) => a.startsWith(`cast:${anc}:`));
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.resolve();
    expect(tg.find('Indomitable Ancients', 'battlefield', 1)).not.toBeNull();
  });

  it('fichas exiladas deixam de existir e não podem ser conjuradas', () => {
    const tg = setup({ battlefield: [PLANICIES, []], hand: [[AW], []] });
    tg.run(createTokens(tg.g, 1, 'Saproling', 1));
    tg.cast(AW).resolve();
    expect(tg.state.zones.exile.filter((id) => tg.state.objects[id].isToken)).toEqual([]);
    expect(tg.names(1, 'battlefield')).toEqual([]);
  });

  it('até o seu próximo turno, os oponentes só conjuram mágicas da mão', () => {
    const tg = setup({
      battlefield: [PLANICIES, ['Forest', 'Island', 'Forest']], hand: [[AW], ['Elvish Mystic']],
      command: [[], [{ name: 'Kinnan, Bonder Prodigy', commander: true }]], library: [Array(4).fill('Plains'), Array(4).fill('Island')],
    });
    tg.cast(AW).resolve();
    tg.passTo('main1', 1);
    const kinnan = tg.find('Kinnan, Bonder Prodigy', 'command', 1)!;
    expect(tg.actionIds().some((a) => a.startsWith(`cast:${kinnan}:`))).toBe(false);
    expect(tg.canCast('Elvish Mystic')).toBe(true);
    // no turno seguinte de Ana o efeito acaba
    tg.passTo('main1', 0).passTo('main1', 1);
    expect(tg.actionIds().some((a) => a.startsWith(`cast:${tg.find('Kinnan, Bonder Prodigy', 'command', 1)}:`))).toBe(true);
  });
});
