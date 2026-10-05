import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Guardian Scalelord', () => {
  it('a outra criatura ganha voar e o gatilho de ataque', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains', { name: 'Glissa Sunslayer', ready: true }], []], hand: [['Guardian Scalelord'], []],
      graveyard: [['Ghostly Prison', 'Forest'], []], library: [['Island'], ['Island']],
    });
    tg.choose('criatura alvo do apoio', ['Glissa Sunslayer']);
    tg.cast('Guardian Scalelord').resolve().resolve();
    const anc = tg.bf('Glissa Sunslayer');
    expect(hasKw(tg.g, anc, 'flying')).toBe(true);
    expect(tg.pt(anc)).toEqual([4, 4]);
    tg.choose('carta de permanente não terreno', ['Ghostly Prison']);
    tg.attack([[anc, 1]]).passTo('declareAttackers').resolve();
    expect(tg.find('Ghostly Prison')).not.toBeNull();
  });
  it('mirando a si mesma, só recebe o marcador', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains'], []], hand: [['Guardian Scalelord'], []] });
    tg.choose('criatura alvo do apoio', ['Guardian Scalelord']);
    tg.cast('Guardian Scalelord').resolve().resolve();
    const g = tg.bf('Guardian Scalelord');
    expect(tg.pt(g)).toEqual([4, 5]);
    expect(tg.state.effects.filter((e) => e.affected?.includes(g)).length).toBe(0);
  });
});
