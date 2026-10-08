import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/api.ts';

const terrenos = ['Mountain', 'Plains', 'Plains'];

describe('Windcrag Siege', () => {
  it('Mardu: CR 603.2d — o gatilho de ataque de um permanente seu dispara uma vez a mais', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Gau, Feral Youth'], []], hand: [['Windcrag Siege'], []], library: [['Island'], ['Island']] });
    tg.choose('Mardu ou Jeskai', ['Mardu — gatilhos causados por criaturas atacando disparam uma vez a mais']);
    tg.cast('Windcrag Siege').resolve();
    tg.attack([['Gau, Feral Youth', 1]]).passTo('declareAttackers').resolveAll();
    expect(tg.state.objects[tg.bf('Gau, Feral Youth')].counters['+1/+1']).toBe(2);
  });

  it('Mardu: gatilhos que não vêm de atacar não dobram', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Plains', 'Plains', 'Plains', 'Plains'], []], hand: [['Windcrag Siege', 'Wall of Omens'], []], library: [['Island', 'Island', 'Island'], ['Island']] });
    tg.choose('Mardu ou Jeskai', ['Mardu — gatilhos causados por criaturas atacando disparam uma vez a mais']);
    tg.cast('Windcrag Siege').resolve();
    tg.cast('Wall of Omens').resolve().resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('Mardu: dobra gatilhos seus causados por criaturas de um oponente atacando, mas não os gatilhos de permanentes do oponente', () => {
    const tg = setup({
      battlefield: [[...terrenos, 'Mangara, the Diplomat'], ['Gau, Feral Youth', 'Elvish Mystic']], hand: [['Windcrag Siege'], []],
      library: [['Island', 'Island', 'Island'], ['Island', 'Island']],
    });
    tg.choose('Mardu ou Jeskai', ['Mardu — gatilhos causados por criaturas atacando disparam uma vez a mais']);
    tg.cast('Windcrag Siege').resolve();
    tg.passTo('main1', 1);
    tg.attack([['Gau, Feral Youth', 0], ['Elvish Mystic', 0]]).passTo('declareAttackers', 1).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Island']); // Mangara dispara duas vezes
    expect(tg.state.objects[tg.bf('Gau, Feral Youth')].counters['+1/+1']).toBe(1); // Gau é de Bruno
  });

  it('Jeskai: na sua manutenção, cria um Goblin 1/1 vermelho com vínculo com a vida e ímpeto até o fim do turno; ataques não dobram', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Gau, Feral Youth'], []], hand: [['Windcrag Siege'], []], library: [['Island', 'Island'], ['Island', 'Island']] });
    tg.choose('Mardu ou Jeskai', ['Jeskai — na sua manutenção, crie uma ficha de Goblin 1/1 com vínculo com a vida e ímpeto']);
    tg.cast('Windcrag Siege').resolve();
    tg.attack([['Gau, Feral Youth', 1]]).passTo('declareAttackers').resolveAll();
    expect(tg.state.objects[tg.bf('Gau, Feral Youth')].counters['+1/+1']).toBe(1);
    expect(tg.find('Goblin')).toBeNull();
    tg.passTo('upkeep', 0);
    tg.passUntil((x) => x.find('Goblin') !== null && x.state.zones.stack.length === 0);
    const gob = tg.bf('Goblin');
    expect(tg.pt(gob)).toEqual([1, 1]);
    expect(tg.state.objects[gob].isToken).toBe(true);
    expect(hasKw(tg.g, gob, 'lifelink')).toBe(true);
    expect(hasKw(tg.g, gob, 'haste')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, gob, 'lifelink')).toBe(false);
    expect(hasKw(tg.g, gob, 'haste')).toBe(false);
  });
});
