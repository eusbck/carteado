import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Mob Verdict';

describe(NOME, () => {
  it('cada jogador vota em outro; oponente com dois votos recebe 4 de dano, e as criaturas dele também; você compra uma carta por voto seu', () => {
    const tg = setup({ players: 3, battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain'], ['Wall of Omens'], []], hand: [[NOME], [], []], library: [['Island', 'Island'], [], []] });
    tg.choose('Mob Verdict', ['Bruno']); // Ana
    tg.choose('Mob Verdict', ['Ana']); // Bruno
    tg.choose('Mob Verdict', ['Bruno']); // Carla
    tg.cast(NOME).resolve();
    expect(tg.life(1)).toBe(36);
    expect(tg.life(2)).toBe(40);
    expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('CR 120.4: dois votos são 4 de dano num evento só (Brash Taunter dispara uma vez, com 4)', () => {
    const tg = setup({ players: 3, battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain'], ['Brash Taunter'], []], hand: [[NOME], [], []], library: [['Island', 'Island'], [], []] });
    tg.choose('Mob Verdict', ['Bruno']); // Ana
    tg.choose('Mob Verdict', ['Ana']); // Bruno
    tg.choose('Mob Verdict', ['Bruno']); // Carla
    tg.choose('oponente alvo', ['Carla']);
    tg.cast(NOME).resolve();
    expect(tg.life(1)).toBe(36);
    expect(tg.state.objects[tg.bf('Brash Taunter')].damage).toBe(4);
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolveAll();
    expect(tg.life(2)).toBe(36);
  });
});
