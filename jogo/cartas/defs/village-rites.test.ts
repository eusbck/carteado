import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Village Rites';

describe(NOME, () => {
  it('sacrifica uma criatura ao conjurar e compra duas', () => {
    const tg = setup({ battlefield: [['Swamp', 'Viscera Seer', 'Hateful Eidolon'], []], hand: [[NOME], []], library: [['Island', 'Forest', 'Plains'], []] });
    let n = 0;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Sacrifique') ? ((n = d.max), { kind: 'select', ids: [d.items.find((i) => i.label === 'Viscera Seer')!.id] }) : null));
    tg.cast(NOME);
    // o sacrifício é custo: já aconteceu com a mágica na pilha
    expect(tg.names(0, 'graveyard')).toEqual(['Viscera Seer']);
    tg.resolve();
    expect(n).toBe(1);
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Forest']);
    expect(tg.find('Hateful Eidolon')).not.toBeNull();
  });

  it('sem criatura para sacrificar, não pode ser conjurada; sacrifica uma só', () => {
    const tg = setup({ battlefield: [['Swamp'], ['Hateful Eidolon']], hand: [[NOME], []] });
    expect(tg.canCast(NOME)).toBe(false);
  });
});
