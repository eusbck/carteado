// Laço de ações obrigatórias (CR 104.4b, 732.4): a partida empata.
import { describe, expect, it } from 'vitest';
import { LIMITE_LACO_OBRIGATORIO } from '../motor/turn.ts';
import { setup } from './harness.ts';

const SALA = 'Secret Arcade // Dusty Parlor';
const abreArcade = (t: ReturnType<typeof setup>) => { const id = t.bf(SALA); t.state.objects[id].face = 0; t.g.bump(); t.refresh(); };
const gatos = (t: ReturnType<typeof setup>) => t.state.zones.battlefield.filter((id) => t.state.objects[id].isToken).length;

describe('Laço de ações obrigatórias', () => {
  it('CR 104.4b: Ajani\'s Chosen com Secret Arcade (cada Gato é um encantamento) empata a partida', () => {
    const tg = setup({
      battlefield: [[SALA, "Ajani's Chosen", 'Sol Ring', 'Plains'], ['Indomitable Ancients']],
      hand: [['Burnished Hart'], []],
      onStart: abreArcade,
    });
    tg.cast('Burnished Hart');
    tg.passUntil((t) => !!t.state.gameOver, 4 * LIMITE_LACO_OBRIGATORIO);
    expect(tg.state.gameOver).toEqual({ winners: [], draw: true, reason: 'laço de ações obrigatórias sem fim' });
    expect(gatos(tg)).toBe(LIMITE_LACO_OBRIGATORIO);
    expect(tg.state.log.at(-1)?.rule).toBe('104.4b');
  }, 60_000);

  it('sem o laço, os gatilhos resolvem e a partida segue', () => {
    const tg = setup({ battlefield: [["Ajani's Chosen", 'Plains', 'Plains', 'Plains'], []], hand: [['Ghostly Prison'], []] });
    tg.cast('Ghostly Prison').resolveAll();
    expect(gatos(tg)).toBe(1);
    expect(tg.state.gameOver).toBeNull();
    expect(tg.state.gatilhosSemAcao?.n).toBe(1);
  });
});
