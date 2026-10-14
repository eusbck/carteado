import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Tower Winder';

describe(N, () => {
  it('alcance e toque mortífero; ao entrar, acha Command Tower no grimório e põe na mão', () => {
    const tg = setup({ battlefield: [[], []], library: [['Island', 'Command Tower', 'Swamp'], []] });
    tg.choose('onde procurar', ['No grimório']).choose('Command Tower', ['Command Tower']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    const id = tg.bf(N);
    expect(hasKw(tg.g, id, 'reach')).toBe(true);
    expect(hasKw(tg.g, id, 'deathtouch')).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Command Tower']);
    expect(tg.names(0, 'library')).toHaveLength(2);
  });
  it('acha Command Tower no cemitério', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [['Command Tower'], []] });
    tg.choose('onde procurar', ['No cemitério']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Command Tower']);
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });
  it('procurando nos dois, pode pegar a do cemitério', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [['Command Tower'], []], library: [['Command Tower', 'Island'], []] });
    tg.choose('onde procurar', ['No grimório e no cemitério']).choose('pegar a Command Tower', ['Command Tower (cemitério)']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Command Tower']);
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.names(0, 'library').sort()).toEqual(['Command Tower', 'Island']);
  });
});
