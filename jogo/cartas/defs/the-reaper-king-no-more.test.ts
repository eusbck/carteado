import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { controllerOf } from '../../motor/api.ts';

describe('The Reaper, King No More', () => {
  it('marcadores em até duas criaturas; a criatura do oponente que morre com marcador vem para você, uma vez por turno', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Mountain', 'Mountain', 'Forest'], ['Elvish Mystic', 'Elvish Mystic']],
      hand: [['The Reaper, King No More'], []], library: [['Island'], ['Island']],
    });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('até duas criaturas') ? { kind: 'select', ids: d.items.filter((i) => i.label === 'Elvish Mystic').map((i) => i.id) } : null));
    tg.yes('The Reaper').yes('The Reaper');
    tg.cast('The Reaper, King No More').resolve().resolveAll();
    const vieram = tg.all('Elvish Mystic');
    // as duas morreram juntas; só uma volta (uma vez por turno)
    expect(vieram.length).toBe(1);
    expect(controllerOf(tg.g, vieram[0])).toBe(0);
    expect(tg.names(1, 'graveyard')).toEqual(['Elvish Mystic']);
  });
});
