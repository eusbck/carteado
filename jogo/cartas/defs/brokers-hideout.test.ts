import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Brokers Hideout';

describe(NOME, () => {
  it('CR 603.12: se sacrifica e, quando faz isso, busca Forest/Plains/Island básica virada e ganha 1 de vida', () => {
    const tg = setup({ hand: [[NOME], []], library: [['Swamp', 'Plains'], []] });
    let habilitadas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Forest, Plains ou Island')) return null;
      habilitadas = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Plains')!.id] };
    });
    tg.play(NOME).resolve();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.zones.stack.length).toBe(1); // gatilho reflexivo
    tg.resolve();
    expect(habilitadas).toEqual(['Plains']);
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    expect(tg.life(0)).toBe(41);
  });
});
