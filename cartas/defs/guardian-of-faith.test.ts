import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { creaturesOf } from '../../motor/api.ts';

describe('Guardian of Faith', () => {
  it('a Aura anexada sai e volta junto; volta na etapa de desvirar do controlador, com os marcadores', () => {
    const tg = setup({
      step: 'main1',
      battlefield: [['Plains', 'Plains', 'Plains', { name: 'Wall of Omens', counters: { '+1/+1': 1 } }, { name: 'Ethereal Armor', attachTo: 'Wall of Omens' }], ['Elvish Mystic']],
      hand: [['Guardian of Faith'], []], library: [['Island', 'Island'], ['Island', 'Island']],
    });
    const w = tg.bf('Wall of Omens');
    tg.choose('outras criaturas alvo', ['Wall of Omens']);
    tg.cast('Guardian of Faith').resolve();
    const enters = tg.state.log.filter((l) => l.text.includes('Wall of Omens entra')).length;
    tg.resolveAll();
    expect(tg.state.objects[w].phasedOut).toBe(true);
    expect(tg.state.objects[tg.bf('Ethereal Armor')].phasedOut).toBe(true);
    expect(creaturesOf(tg.g, 0)).not.toContain(w);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');
    expect(tg.state.objects[w].phasedOut).toBe(false);
    expect(tg.state.objects[tg.bf('Ethereal Armor')].phasedOut).toBe(false);
    expect(tg.state.objects[tg.bf('Ethereal Armor')].attachedTo).toBe(w);
    expect(tg.state.objects[w].counters['+1/+1']).toBe(1);
    expect(tg.state.log.filter((l) => l.text.includes('Wall of Omens entra')).length).toBe(enters);
  });
  it('atacante que sai de fase deixa o combate; fora de fase não pode ser alvo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Elvish Mystic'], ['Mountain']], hand: [['Guardian of Faith'], ['Abrade']], library: [['Island'], ['Island']] });
    tg.attack([['Elvish Mystic', 1]]);
    tg.choose('outras criaturas alvo', ['Elvish Mystic']);
    tg.cast('Guardian of Faith').resolve().resolveAll();
    expect(tg.state.combat?.attackers.find((a) => a.id === tg.bf('Elvish Mystic'))?.removed ?? true).toBe(true);
    tg.passTo('main2');
    expect(tg.life(1)).toBe(40);
  });
});
