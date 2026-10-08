import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { addEffect } from '../../motor/api.ts';

describe('Go for the Throat', () => {
  it('destrói a criatura não artefato alvo; criatura artefato não pode ser alvo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Hateful Eidolon', 'The Reaper, King No More']], hand: [['Go for the Throat'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('criatura não artefato alvo') ? (opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Hateful Eidolon')!.id] }) : null));
    tg.cast('Go for the Throat').resolve();
    expect(opcoes).toEqual(['Hateful Eidolon']);
    expect(tg.find('Hateful Eidolon')).toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Hateful Eidolon']);
  });

  it('se o alvo virou artefato, a mágica não resolve', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Hateful Eidolon']], hand: [['Go for the Throat'], []] });
    tg.choose('criatura não artefato alvo', ['Hateful Eidolon']).cast('Go for the Throat');
    const alvo = tg.bf('Hateful Eidolon');
    addEffect(tg.g, { source: alvo, sourceDef: '', controller: 1, duration: { kind: 'endOfTurn' }, affected: [alvo], mods: [{ k: 'addTypes', types: ['Artifact'] }] });
    tg.refresh().resolve();
    expect(tg.find('Hateful Eidolon')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Go for the Throat']);
  });
});
