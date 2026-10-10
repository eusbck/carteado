// Parada inteligente (09/10, respondWhenAble): com algo instantâneo para jogar, a mesa espera a pessoa quando um
// oponente põe algo na pilha, ataca no turno dele ou chega na etapa final dele, mesmo sem essas paradas marcadas.
// Sem jogada, passa. O testador não conseguia responder no turno dos outros com as paradas padrão da fase 9.
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import { shouldAutoPass, type StopSettings } from '../motor/autopass.ts';
import { setup, type TestGame } from './harness.ts';

/** as paradas padrão do servidor (servidor/salas.ts PARADAS_PADRAO), com a parada inteligente ausente = ligada */
const PADRAO: StopSettings = { myTurn: ['main1', 'beginCombat', 'main2'], othersTurn: [], stopOnOpponentStack: false, stopOnOwnStack: false, passUntilTurnEnds: null };
const SEM_INTELIGENTE: StopSettings = { ...PADRAO, respondWhenAble: false };

const passaSozinho = (tg: TestGame, quem: number, st: StopSettings = PADRAO) => {
  expect(tg.pending?.kind).toBe('priority');
  expect(tg.pending!.player).toBe(quem);
  return shouldAutoPass(tg.state, tg.pending!, quem, st);
};

describe('parada inteligente', () => {
  it('mágica de um oponente na pilha: para quem tem resposta, passa quem não tem', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Island', 'Island']], hand: [["Night's Whisper"], ['Counterspell']] });
    tg.cast("Night's Whisper").pass();
    expect(passaSozinho(tg, 1)).toBe(false);
    expect(passaSozinho(tg, 1, SEM_INTELIGENTE)).toBe(true);
    // sem mana para o Counterspell não há jogada: passa
    const sem = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [["Night's Whisper"], ['Counterspell']] });
    sem.cast("Night's Whisper").pass();
    expect(passaSozinho(sem, 1)).toBe(true);
  });

  it('a própria mágica no topo: segue as paradas de sempre (não para só por ter resposta)', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Swamp', 'Swamp'], []], hand: [["Night's Whisper", 'Counterspell'], []] });
    tg.cast("Night's Whisper");
    expect(passaSozinho(tg, 0)).toBe(true);
  });

  it('ataque no turno do oponente: para com uma instantânea, passa sem ela ou sem ataque', () => {
    const tg = setup({ battlefield: [['Elvish Mystic'], ['Plains']], hand: [[], ['Swords to Plowshares']], library: [['Forest', 'Forest'], ['Plains', 'Plains']] });
    tg.attack([['Elvish Mystic', 1]]).passTo('declareAttackers', 0).pass();
    expect(passaSozinho(tg, 1)).toBe(false);
    expect(passaSozinho(tg, 1, SEM_INTELIGENTE)).toBe(true);
    // ninguém atacou: a etapa dá prioridade mesmo assim, e aí não há o que responder
    const sem = setup({ battlefield: [['Elvish Mystic'], ['Plains']], hand: [[], ['Swords to Plowshares']], library: [['Forest', 'Forest'], ['Plains', 'Plains']] });
    sem.attack([]).passTo('declareAttackers', 0).pass();
    expect(sem.state.turn.step).toBe('declareAttackers');
    expect(sem.state.combat?.attackers.length ?? 0).toBe(0);
    expect(passaSozinho(sem, 1)).toBe(true);
  });

  it('etapa final do oponente: para com uma instantânea; no próprio turno, não', () => {
    const tg = setup({ battlefield: [['Elvish Mystic', 'Plains'], ['Plains']], hand: [['Swords to Plowshares'], ['Swords to Plowshares']], library: [['Forest', 'Forest'], ['Plains', 'Plains']] });
    tg.passTo('end', 0);
    // Ana, na etapa final do próprio turno, com a instantânea: segue as paradas dela (end não é parada)
    expect(passaSozinho(tg, 0)).toBe(true);
    tg.pass();
    expect(passaSozinho(tg, 1)).toBe(false);
    expect(passaSozinho(tg, 1, SEM_INTELIGENTE)).toBe(true);
  });

  it('manutenção e compra do oponente, com a pilha vazia: passa mesmo com instantânea', () => {
    const tg = setup({ battlefield: [['Elvish Mystic', 'Plains'], ['Plains']], hand: [[], ['Swords to Plowshares']], library: [['Forest', 'Forest'], ['Plains', 'Plains']] });
    tg.passTo('upkeep', 1);
    tg.passTo('upkeep', 0);
    expect(tg.state.turn.active).toBe(0);
    if (tg.pending?.player === 0) tg.pass();
    expect(passaSozinho(tg, 1)).toBe(true);
  });

  it('"passar até o fim do turno" pula o ataque e a etapa final do oponente mesmo com instantânea', () => {
    const tg = setup({ battlefield: [['Elvish Mystic', 'Plains'], ['Plains']], hand: [[], ['Swords to Plowshares']], library: [['Forest', 'Forest'], ['Plains', 'Plains']] });
    tg.attack([['Elvish Mystic', 1]]).passTo('declareAttackers', 0).pass();
    const ate = { ...PADRAO, passUntilTurnEnds: tg.state.turn.number };
    expect(passaSozinho(tg, 1, ate)).toBe(true);
    tg.passTo('end', 0).pass();
    expect(passaSozinho(tg, 1, ate)).toBe(true);
    expect(passaSozinho(tg, 1)).toBe(false);
  });

  it('"passar até o fim do turno" não engole a mágica de um oponente quando dá para responder', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Island', 'Island']], hand: [["Night's Whisper"], ['Counterspell']] });
    tg.cast("Night's Whisper").pass();
    expect(passaSozinho(tg, 1, { ...PADRAO, passUntilTurnEnds: tg.state.turn.number })).toBe(false);
    expect(passaSozinho(tg, 1, { ...SEM_INTELIGENTE, passUntilTurnEnds: tg.state.turn.number })).toBe(true);
  });
});
