import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Mobilizer Mech';

describe(N, () => {
  it('tripulado, o outro Veículo alvo vira criatura sem disparar o "fica tripulado" dele', () => {
    // o Ghost Ark daria desenterrar ao Silver Myr do cemitério se contasse como tripulado
    const tg = setup({ battlefield: [[N, 'Ghost Ark', "Cultivator's Caravan", 'Ripjaw Raptor', 'Swamp', 'Swamp', 'Swamp'], []], graveyard: [['Silver Myr'], []] });
    tg.choose('Tripular:', ['Ripjaw Raptor']).choose('Tripular:', ['done']).choose('até um outro Veículo alvo', ['Ghost Ark']).activate(N, 'Tripular').resolveAll();
    const m = tg.bf(N);
    const a = tg.bf('Ghost Ark');
    expect(hasKw(tg.g, m, 'flying')).toBe(true);
    expect(chars(tg.g, m).types).toEqual(['Artifact', 'Creature']);
    expect(chars(tg.g, a).types).toEqual(['Artifact', 'Creature']);
    expect(chars(tg.g, tg.bf("Cultivator's Caravan")).types).toEqual(['Artifact']);
    expect(() => tg.activate('Silver Myr', 'Desenterrar')).toThrow();
  });
});
