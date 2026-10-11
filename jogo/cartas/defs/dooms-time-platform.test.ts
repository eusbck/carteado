import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Doom's Time Platform";
const lib = Array(10).fill('Island');

describe(N, () => {
  it('ao atacar, exila uma carta que não é terreno do seu cemitério com dois marcadores de tempo e suspender', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []], graveyard: [['Indomitable Ancients', 'Swamp'], []], library: [lib, lib] });
    tg.choose('carta que não é terreno alvo', ['Indomitable Ancients']);
    tg.attack([['Elvish Mystic', 1]]).passTo('main2', 0);
    expect(tg.names(0, 'exile')).toEqual(['Indomitable Ancients']);
    const carta = tg.state.zones.exile[0];
    expect(tg.state.objects[carta].counters.time).toBe(2);
    tg.script.length = 0;
    tg.yes('Indomitable Ancients', true);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Swamp']);
  });

  it('terreno no cemitério não é alvo: sem alvo legal, o gatilho não vai para a pilha', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []], graveyard: [['Swamp'], []], library: [lib, lib] });
    tg.attack([['Elvish Mystic', 1]]).passTo('main2', 0);
    expect(tg.names(0, 'graveyard')).toEqual(['Swamp']);
  });
});
