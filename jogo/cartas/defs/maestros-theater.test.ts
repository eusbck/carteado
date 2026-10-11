import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Maestros Theater';

describe(NOME, () => {
  it('CR 603.12: se sacrifica e, quando faz isso, busca Island/Swamp/Mountain básica virada e ganha 1 de vida', () => {
    const tg = setup({ hand: [[NOME], []], library: [['Plains', 'Swamp'], []] });
    let habilitadas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Island, Swamp ou Mountain')) return null;
      habilitadas = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Swamp')!.id] };
    });
    tg.play(NOME).resolve();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.zones.stack.length).toBe(1); // gatilho reflexivo
    tg.resolve();
    expect(habilitadas).toEqual(['Swamp']);
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(true);
    expect(tg.life(0)).toBe(41);
  });
});
