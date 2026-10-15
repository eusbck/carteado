import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const ilhas = Array(6).fill('Island');

describe('Dream Eater', () => {
  it('vigia 4 e depois devolve a permanente do oponente escolhida', () => {
    const tg = setup({ active: 1, battlefield: [ilhas, ['Sol Ring', 'Forest']], hand: [['Dream Eater'], []], library: [['Island', 'Forest', 'Swamp', 'Plains', 'Island'], []] });
    tg.pass();
    tg.script.push((d) => (d.kind === 'arrange' && d.prompt.includes('Vigiar 4')
      ? { kind: 'arrange', order: d.items.map((i) => i.id), placement: Object.fromEntries(d.items.map((i, k) => [i.id, k < 2 ? 'graveyard' : 'top'])) }
      : null));
    let oferecidos: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('permanente não terreno alvo') ? (oferecidos = d.items.map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] }) : null));
    tg.cast('Dream Eater');
    tg.resolve(); // a criatura entra (lampejo, no turno do oponente)
    expect(hasKw(tg.g, tg.bf('Dream Eater'), 'flying')).toBe(true);
    tg.resolve(); // vigia 4
    expect(tg.names(0, 'graveyard')).toEqual(['Island', 'Forest']);
    tg.resolve(); // o reflexivo
    expect(oferecidos).toEqual(['Sol Ring']);
    expect(tg.names(1, 'hand')).toEqual(['Sol Ring']);
  });

  it('com o grimório vazio, o gatilho reflexivo ainda acontece', () => {
    const tg = setup({ battlefield: [ilhas, ['Sol Ring']], hand: [['Dream Eater'], []] });
    tg.choose('permanente não terreno alvo', ['Sol Ring']);
    tg.cast('Dream Eater').resolve().resolve().resolve();
    expect(tg.names(1, 'hand')).toEqual(['Sol Ring']);
  });
});
