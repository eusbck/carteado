import { describe, expect, it } from 'vitest';
import { moveObjects } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Valakut Exploration';

describe(N, () => {
  it('jogar um terreno exila a carta do topo, que pode ser jogada', () => {
    const tg = setup({ battlefield: [[N, 'Exploration'], []], hand: [['Mountain'], []], library: [['Forest', 'Island'], []] });
    tg.play('Mountain').resolve();
    expect(tg.names(0, 'exile')).toEqual(['Forest']);
    tg.play('Forest').resolve();
    expect(tg.find('Forest')).not.toBeNull();
    expect(tg.names(0, 'exile')).toEqual(['Island']);
  });
  it('a carta jogada antes da etapa final não conta para o dano', () => {
    const tg = setup({ battlefield: [[N, 'Exploration', 'Exploration'], []], hand: [['Mountain', 'Mountain'], []], library: [['Forest', 'Island', 'Plains', 'Plains'], []] });
    tg.play('Mountain').resolve();
    tg.play('Mountain').resolve();
    tg.play('Forest').resolve();
    // exiladas: Island (de quando a Forest entrou) e o que veio depois; a Forest foi jogada
    expect(tg.names(0, 'exile').sort()).toEqual(['Island', 'Plains']);
    tg.passTo('end');
    tg.resolve();
    expect(tg.life(1)).toBe(38);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Island', 'Plains']);
  });
  it('se o encantamento sai do campo, as cartas continuam exiladas e jogáveis', () => {
    const tg = setup({ battlefield: [[N, 'Exploration'], []], hand: [['Mountain'], []], library: [['Forest', 'Island'], []] });
    tg.play('Mountain').resolve();
    tg.run(moveObjects(tg.g, [{ id: tg.bf(N), to: 'graveyard' }], 'effect'));
    tg.refresh().play('Forest');
    expect(tg.find('Forest')).not.toBeNull();
  });
});
