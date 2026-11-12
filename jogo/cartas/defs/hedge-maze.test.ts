import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Hedge Maze';

describe(NOME, () => {
  it('CR 305.6: mana dos tipos Forest e Island', () => {
    expect(alternativasDeMana(NOME)).toEqual(['G', 'U']);
  });
  it('entra virado e vigia 1: a carta do topo pode ir para o cemitério', () => {
    const tg = setup({ hand: [[NOME], []], library: [['Hex', 'Island'], []] });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'graveyard'])), order: d.items.map((i) => i.id) } : null));
    tg.play(NOME).resolveAll();
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
    expect(tg.names(0, 'graveyard')).toEqual(['Hex']);
    expect(tg.names(0, 'library')).toEqual(['Island']);
  });
});
