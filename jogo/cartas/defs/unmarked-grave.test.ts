import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Unmarked Grave';

describe(NOME, () => {
  it('só acha cartas que não são lendárias e as põe no cemitério', () => {
    let opcoes: string[] = [];
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[NOME], []], library: [['Wall of Omens', 'Ragavan, Nimble Pilferer'], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Procure') ? ((opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label)), { kind: 'select', ids: [d.items.find((i) => i.label === 'Wall of Omens')!.id] }) : null));
    tg.cast(NOME).resolve();
    expect(opcoes).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'graveyard')).toContain('Wall of Omens');
  });
});
