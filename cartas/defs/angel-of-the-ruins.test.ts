import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Angel of the Ruins', () => {
  it('ao entrar, exila até dois artefatos e/ou encantamentos alvo (criaturas comuns não servem)', () => {
    const tg = setup({
      battlefield: [[...Array(7).fill('Plains')], ['Sol Ring', 'Everlasting Torment', 'Mind Stone', 'Wall of Omens']],
      hand: [['Angel of the Ruins'], []],
    });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('artefatos e/ou encantamentos')) return null;
      opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: d.items.filter((i) => i.label === 'Sol Ring' || i.label === 'Everlasting Torment').map((i) => i.id) };
    });
    tg.cast('Angel of the Ruins').resolve().resolveAll();
    expect(opcoes).toContain('Angel of the Ruins'); // é uma criatura artefato
    expect(opcoes).not.toContain('Wall of Omens');
    expect(opcoes).not.toContain('Plains');
    expect(tg.names(1, 'exile').sort()).toEqual(['Everlasting Torment', 'Sol Ring']);
    expect(tg.names(1, 'battlefield').sort()).toEqual(['Mind Stone', 'Wall of Omens']);
  });

  it('pode escolher nenhum alvo', () => {
    const tg = setup({ battlefield: [[...Array(7).fill('Plains')], ['Sol Ring']], hand: [['Angel of the Ruins'], []] });
    tg.choose('artefatos e/ou encantamentos', []);
    tg.cast('Angel of the Ruins').resolve().resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.find('Angel of the Ruins')).not.toBeNull();
  });

  it('CR 702.29e: ciclagem de Planície acha qualquer carta de Planície, mesmo não básica, e embaralha', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], []], hand: [['Angel of the Ruins'], []], library: [['Island', 'Mistveil Plains', 'Swamp'], []] });
    let disponiveis: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('carta de Planície')) return null;
      disponiveis = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: d.items.filter((i) => i.label === 'Mistveil Plains').map((i) => i.id) };
    });
    tg.activate('Angel of the Ruins', 'Ciclagem de Planície').resolve();
    expect(disponiveis).toEqual(['Mistveil Plains']);
    expect(tg.names(0, 'hand')).toEqual(['Mistveil Plains']);
    expect(tg.names(0, 'graveyard')).toEqual(['Angel of the Ruins']);
    expect(tg.names(0, 'library').sort()).toEqual(['Island', 'Swamp']);
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
  });
});
