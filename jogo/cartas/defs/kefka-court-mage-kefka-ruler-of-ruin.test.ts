import { describe, expect, it } from 'vitest';
import { loseLife } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const NOME = 'Kefka, Court Mage // Kefka, Ruler of Ruin';

describe('Kefka, Court Mage', () => {
  it('compra uma carta para cada tipo de carta entre as descartadas', () => {
    const tg = setup({
      battlefield: [['Island', 'Island', 'Swamp', 'Swamp', 'Mountain'], []],
      hand: [[NOME, 'Dark Ritual'], ['Island', 'Wall of Omens']], library: [['Forest', 'Forest', 'Forest', 'Forest'], []],
    });
    tg.script.push((d) => (d.kind === 'select' && d.player === 1 && d.prompt.includes('Descarte') ? { kind: 'select', ids: [d.items.find((i) => i.label === 'Wall of Omens')!.id] } : null));
    tg.cast(NOME).resolveAll();
    // instantânea + criatura = 2 tipos
    expect(tg.names(0, 'hand')).toEqual(['Forest', 'Forest']);
  });

  it('{8} faz cada oponente sacrificar um permanente e Kefka transforma; no verso, perder vida no seu turno compra cartas', () => {
    const tg = setup({ battlefield: [[NOME, ...Array(8).fill('Swamp')], ['Wall of Omens']], hand: [['Burnt Offering'], []], library: [['Forest', 'Forest', 'Forest', 'Forest'], []] });
    tg.activate('Kefka, Court Mage').resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
    const id = tg.bf(NOME);
    expect(tg.state.objects[id].face).toBe(1);
    loseLife(tg.g, 1, 3, null);
    tg.refresh();
    tg.resolveAll();
    expect(tg.names(0, 'hand').filter((n) => n === 'Forest')).toHaveLength(3);
  });
});
