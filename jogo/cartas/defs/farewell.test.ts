import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Farewell';
const ART = 'Exile todos os artefatos';
const CRI = 'Exile todas as criaturas';
const ENC = 'Exile todos os encantamentos';
const CEM = 'Exile todos os cemitérios';
const planicies = Array(6).fill('Plains');

describe(N, () => {
  it('escolhendo só criaturas, exila todas as criaturas (as de artefato também) e deixa o resto', () => {
    const tg = setup({
      battlefield: [[...planicies, 'Silver Myr', 'Sol Ring', 'Smothering Tithe'], ['Wall of Omens', 'Indomitable Ancients']],
      hand: [[N], []], graveyard: [['Island'], ['Island']],
    });
    tg.choose('modo', [CRI]).cast(N).resolve();
    expect(tg.find('Silver Myr', 'exile')).not.toBeNull();
    expect(tg.find('Wall of Omens', 'exile')).not.toBeNull();
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
    expect(tg.bf('Sol Ring')).not.toBeNull();
    expect(tg.bf('Smothering Tithe')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Island', N]);
    expect(tg.names(1, 'graveyard')).toEqual(['Island']);
  });

  it('escolhendo todos os modos, faz cada um na ordem impressa e exila também os cemitérios de todos', () => {
    const tg = setup({
      battlefield: [[...planicies, 'Silver Myr', 'Sol Ring', 'Smothering Tithe'], ['Wall of Omens']],
      hand: [[N], []], graveyard: [['Island'], ['Swamp', 'Forest']],
    });
    tg.choose('modo', [ART, CRI, ENC, CEM]).cast(N).resolve();
    for (const nome of ['Silver Myr', 'Sol Ring', 'Smothering Tithe', 'Wall of Omens', 'Island', 'Swamp', 'Forest']) expect(tg.find(nome, 'exile')).not.toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual([]);
    // a própria Farewell ainda está na pilha durante a resolução: vai para o cemitério depois (CR 608.2n)
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    expect(tg.state.zones.battlefield.every((id) => tg.state.objects[id].def === 'Plains')).toBe(true);
  });

  it('escolhendo artefatos e encantamentos, as criaturas que não são artefato ficam', () => {
    const tg = setup({
      battlefield: [[...planicies, 'Silver Myr', 'Sol Ring', 'Smothering Tithe'], ['Wall of Omens']],
      hand: [[N], []],
    });
    tg.choose('modo', [ART, ENC]).cast(N).resolve();
    expect(tg.find('Silver Myr', 'exile')).not.toBeNull();
    expect(tg.find('Sol Ring', 'exile')).not.toBeNull();
    expect(tg.find('Smothering Tithe', 'exile')).not.toBeNull();
    expect(tg.bf('Wall of Omens')).not.toBeNull();
  });
});
