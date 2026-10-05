import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Shadrix Silverquill', () => {
  it('zero ou dois modos, nunca um; jogadores diferentes; o terceiro modo pode mirar quem não tem criaturas', () => {
    const tg = setup({ battlefield: [['Shadrix Silverquill', 'Wall of Omens'], []], library: [['Island'], ['Island', 'Island']] });
    const erros: (string | null)[] = [];
    let jogadoresSegundoAlvo: string[] = [];
    tg.script.push((d, x) => {
      if (d.kind !== 'select' || !d.prompt.includes('modo')) return null;
      erros.push(x.game.check(0, { kind: 'select', ids: ['0'] }));
      return { kind: 'select', ids: ['1', '2'] };
    });
    tg.choose('compra e perde 1', ['Bruno']);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('marcadores') ? (jogadoresSegundoAlvo = d.items.map((i) => i.label), { kind: 'select', ids: [d.items[0].id] }) : null));
    tg.passTo('beginCombat').resolve();
    expect(erros[0]).toMatch(/0 ou 2/);
    expect(jogadoresSegundoAlvo).toEqual(['Ana']);
    expect([tg.names(1, 'hand'), tg.life(1)]).toEqual([['Island'], 39]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 5]);
  });
  it('pode não escolher nenhum modo', () => {
    const tg = setup({ battlefield: [['Shadrix Silverquill'], []], library: [['Island'], ['Island']] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('modo') ? { kind: 'select', ids: [] } : null));
    tg.passTo('beginCombat');
    expect(tg.state.zones.stack.length).toBe(0);
  });
});
