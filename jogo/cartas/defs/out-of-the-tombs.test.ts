import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/actions.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Out of the Tombs';

describe(N, () => {
  it('na sua manutenção: dois marcadores de éon e tritura cartas iguais aos marcadores', () => {
    const tg = setup({ active: 1, battlefield: [[N], []], library: [Array(6).fill('Island'), Array(3).fill('Island')] });
    tg.passTo('draw', 0);
    expect(tg.state.objects[tg.bf(N)].counters.eon).toBe(2);
    expect(tg.names(0, 'graveyard')).toHaveLength(2);
  });

  it('com o grimório vazio, cada compra vira devolver uma criatura do cemitério ao campo; sem criatura, você perde o jogo', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []], library: [[], ['Island'], ['Island']], graveyard: [['Serra Angel', 'Silver Myr', 'Island'], [], []] });
    for (const nome of ['Serra Angel', 'Silver Myr']) tg.script.push((d) => { const i = d.kind === 'select' && d.prompt.includes('Out of the Tombs') ? d.items.find((x) => x.label === nome) : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    runEffect(tg, draw(tg.g, 0, 2));
    tg.refresh();
    expect(tg.find('Serra Angel')).not.toBeNull();
    expect(tg.find('Silver Myr')).not.toBeNull();
    expect(tg.state.players[0].left).toBe(false);
    runEffect(tg, draw(tg.g, 0, 1));
    tg.refresh();
    expect(tg.state.players[0].left).toBe(true);
  });
});