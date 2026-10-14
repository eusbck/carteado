import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Armed and Armored';

describe(N, () => {
  it('os Veículos viram criaturas até o fim do turno e os Equipamentos escolhidos vão para o Dwarf', () => {
    const tg = fixture({ battlefield: [["Cultivator's Caravan", 'Sram, Senior Edificer', 'Shadowspear', 'Tangleweave Armor', 'Plains', 'Plains'], []], hand: [[N], []] });
    tg.choose('anexe quantos Equipamentos', ['Shadowspear']);
    tg.cast(N).resolveAll();
    const v = tg.bf("Cultivator's Caravan");
    expect(chars(tg.g, v).types).toEqual(['Artifact', 'Creature']);
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBe(tg.bf('Sram, Senior Edificer'));
    expect(tg.state.objects[tg.bf('Tangleweave Armor')].attachedTo).toBeNull();
    tg.passTo('upkeep', 1);
    expect(chars(tg.g, v).types).toEqual(['Artifact']);
  });

  it('os Veículos viram criaturas; sem Dwarf, nada é anexado', () => {
    const tg = fixture({ battlefield: [["Cultivator's Caravan", 'Shadowspear', 'Indomitable Ancients', 'Plains', 'Plains'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(chars(tg.g, tg.bf("Cultivator's Caravan")).types).toContain('Creature');
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBeNull();
  });
});
