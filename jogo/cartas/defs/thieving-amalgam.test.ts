import { describe, expect, it } from 'vitest';
import { buildView } from '../../motor/view.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Thieving Amalgam';
const ilhas = Array(8).fill('Island');

describe(N, () => {
  it('no início da manutenção de cada oponente, manifesta o topo dele sob o seu controle; ele não vê a carta', () => {
    const tg = setup({ battlefield: [[N], []], library: [ilhas, ['Baleful Strix', ...ilhas]] });
    tg.passTo('draw', 1);
    const m = tg.state.zones.battlefield.find((id) => tg.state.objects[id].faceDown)!;
    expect(m).toBeDefined();
    expect(tg.state.objects[m].def).toBe('Baleful Strix');
    expect(tg.state.objects[m].controller).toBe(0);
    expect(tg.state.objects[m].owner).toBe(1);
    expect(buildView(tg.g, 1, null).battlefield.find((o) => o.id === m)!.name).toBe('Virada para baixo');
  });

  it('quando a criatura de outro dono morre, o dono perde 2 e você ganha 2', () => {
    const tg = setup({ battlefield: [[N], []], library: [ilhas, ['Baleful Strix', ...ilhas]] });
    tg.passTo('draw', 1);
    const m = tg.state.zones.battlefield.find((id) => tg.state.objects[id].faceDown)!;
    removeCard(tg, m);
    tg.resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Baleful Strix']);
    expect(tg.life(1)).toBe(38);
    expect(tg.life(0)).toBe(42);
  });

  it('uma criatura sua que morre não conta', () => {
    const tg = setup({ battlefield: [[N, 'Slither Blade'], []] });
    removeCard(tg, tg.bf('Slither Blade'));
    tg.resolveAll();
    expect(tg.life(0)).toBe(40);
    expect(tg.life(1)).toBe(40);
  });
});
