import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';
import { addEffect } from '../../motor/api.ts';

describe('White Orchid Phantom', () => {
  it('destrói terreno não básico; o controlador dele pode buscar um básico virado', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Command Tower', 'Forest']], hand: [['White Orchid Phantom'], []], library: [[], ['Island']] });
    tg.choose('terreno não básico', ['Command Tower']).yes('terreno básico', true).choose('Procure uma carta', ['Island']);
    tg.cast('White Orchid Phantom').resolve().resolve();
    expect(hasKw(tg.g, tg.bf('White Orchid Phantom'), 'first strike')).toBe(true);
    expect(tg.names(1, 'graveyard')).toEqual(['Command Tower']);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
  });
  it('o controlador busca mesmo que o terreno não seja destruído', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Command Tower']], hand: [['White Orchid Phantom'], []], library: [[], ['Island']] });
    tg.choose('terreno não básico', ['Command Tower']).yes('terreno básico', true).choose('Procure uma carta', ['Island']);
    tg.cast('White Orchid Phantom');
    tg.resolve();
    // Command Tower fica indestrutível antes de o gatilho resolver
    addEffect(tg.g, { source: -1, sourceDef: '', controller: 1, duration: { kind: 'endOfTurn' }, affected: [tg.bf('Command Tower')], mods: [{ k: 'addKeyword', kw: 'indestructible' }] });
    tg.resolve();
    expect(tg.find('Command Tower')).not.toBeNull();
    expect(tg.find('Island')).not.toBeNull();
  });
});
