import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { manaOptions } from '../../motor/costs.ts';

const NOME = 'Big Apple, 3 a.m.';

describe(NOME, () => {
  it('CR 614.12a: entra virado; ao entrar, escolhe uma cor e produz só essa cor', () => {
    const tg = setup({ hand: [[NOME], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('escolha uma cor') ? { kind: 'select', ids: ['G'] } : null));
    tg.play(NOME);
    const id = tg.bf(NOME);
    expect(tg.state.objects[id].tapped).toBe(true);
    expect(tg.state.objects[id].choices.color).toBe('G');
    tg.state.objects[id].tapped = false;
    tg.refresh();
    expect(manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join(''))).toEqual(['G']);
  });
  it('{5}, {T}: uma ficha Rat preta 1/1 para cada oponente (quatro jogadores)', () => {
    const tg = setup({ players: 4, battlefield: [[NOME, 'Sol Ring', 'Sol Ring', 'Plains'], [], [], []] });
    tg.activate(NOME, 'Rat').resolve();
    const ratos = tg.all('Rat');
    expect(ratos.length).toBe(3);
    expect(ratos.every((r) => tg.state.objects[r].controller === 0)).toBe(true);
    expect(tg.pt(ratos[0])).toEqual([1, 1]);
  });
});
