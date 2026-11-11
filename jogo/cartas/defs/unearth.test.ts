import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Unearth';

describe(NOME, () => {
  it('devolve uma criatura de valor 3 ou menos; maiores não podem ser alvo', () => {
    let opcoes: string[] = [];
    const tg = setup({ battlefield: [['Swamp'], []], hand: [[NOME], []], graveyard: [['Wall of Omens', 'Zetalpa, Primal Dawn'], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('carta de criatura alvo') ? ((opcoes = d.items.map((i) => i.label)), { kind: 'select', ids: [d.items[0].id] }) : null));
    tg.cast(NOME).resolve();
    expect(opcoes).toEqual(['Wall of Omens']);
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });

  it('ciclagem {2}', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[NOME], []], library: [['Island'], []] });
    tg.activate(NOME, 'Ciclagem').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
