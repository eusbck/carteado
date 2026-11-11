import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { draw } from '../../motor/api.ts';

const GS = 'Gleaming Splendor';

describe(GS, () => {
  it('o oponente que compra a segunda carta no turno dá um Tesouro, só uma vez por turno', () => {
    const tg = setup({ battlefield: [[GS], []], library: [['Island', 'Island'], Array(5).fill('Island')] });
    tg.run(draw(tg.g, 1, 1));
    expect(tg.state.zones.stack.length).toBe(0);
    tg.run(draw(tg.g, 1, 3));
    tg.resolve();
    expect(tg.names(0, 'battlefield').filter((n) => n === 'Treasure').length).toBe(1);
    expect(tg.state.zones.stack.length).toBe(0);
    // as suas compras não contam
    tg.run(draw(tg.g, 0, 2));
    expect(tg.state.zones.stack.length).toBe(0);
  });

  it('os dois alvos precisam ser jogadores diferentes', () => {
    const tg = setup({ battlefield: [[GS, 'Plains', 'Plains', 'Plains'], []], library: [['Island'], ['Island']] });
    let segundo: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('primeiro jogador alvo') ? { kind: 'select', ids: [d.items.find((i) => i.label === 'Ana')!.id] } : null));
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('segundo jogador alvo')) return null;
      segundo = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Bruno')!.id] };
    });
    tg.activate(GS).resolve();
    expect(segundo).toEqual(['Bruno']);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.names(1, 'hand')).toEqual(['Island']);
  });
});
