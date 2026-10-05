import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

describe('Leitmotif Composer', () => {
  it('a ficha cópia também cria cópias', () => {
    const tg = setup({
      battlefield: [['Leitmotif Composer', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Aberrant Return'], []], graveyard: [['Wall of Omens'], []],
      library: [['Plains', 'Plains'], []],
    });
    tg.run(createTokens(tg.g, 0, { copyOf: { def: 'Leitmotif Composer', face: 0 } }, 1));
    tg.choose('alvo', ['Wall of Omens']);
    tg.cast('Aberrant Return').resolveAll();
    expect(tg.all('Leitmotif Composer').length).toBe(4);
  });
  it('{2}{U}: as criaturas chamadas Leitmotif Composer não podem ser bloqueadas', () => {
    const tg = setup({ battlefield: [[{ name: 'Leitmotif Composer', ready: true }, 'Island', 'Island', 'Island'], ['Wall of Omens']], library: [['Plains'], ['Island']] });
    tg.activate('Leitmotif Composer').resolve();
    let podia = false; // sem candidatos, o motor nem pede bloqueadores
    tg.script.push((d) => (d.kind === 'blockers' ? (podia = d.candidates.some((x) => x.canBlock.length > 0), { kind: 'blockers', blocks: [] }) : null));
    tg.attack([['Leitmotif Composer', 1]]).passTo('main2');
    expect(podia).toBe(false);
    expect(tg.life(1)).toBe(38);
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
  });
});
