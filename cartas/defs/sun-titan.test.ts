import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Sun Titan', () => {
  it('terreno tem valor de mana 0 e pode voltar; ao atacar, devolve outro', () => {
    const tg = setup({
      battlefield: [[...Array(6).fill('Plains')], []], hand: [['Sun Titan'], []],
      graveyard: [['Plains', 'Sol Ring', 'Archfiend of Depravity', 'Night\'s Whisper'], []], library: [['Island'], ['Island']],
    });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('valor de mana 3 ou menos') ? (opcoes = d.items.map((i) => i.label).sort(), { kind: 'select', ids: [d.items.find((i) => i.label === 'Plains')!.id] }) : null));
    tg.yes('Sun Titan');
    tg.cast('Sun Titan').resolve().resolveAll();
    expect(opcoes).toEqual(['Plains', 'Sol Ring']);
    expect(tg.all('Plains').length).toBe(7);
  });
});
