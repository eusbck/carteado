// Bot heurístico: decisões básicas em situações montadas (terreno, remoção, ataque, bloqueio, escolhas forçadas).
import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from './harness.ts';
import { HeuristicBot } from '../bots/heuristico.ts';
import { avaliar } from '../bots/avaliacao.ts';
import { determinizar } from '../bots/simulacao.ts';
import { seedFrom } from '../motor/rng.ts';

/** o bot responde por `eu`; os outros passam ou usam a resposta padrão, até `parar` valer ou acabar o limite */
function jogar(tg: TestGame, bot: HeuristicBot, parar: (tg: TestGame) => boolean, limite = 300): void {
  for (let i = 0; i < limite && tg.pending && !tg.game.isOver(); i++) {
    if (parar(tg)) return;
    const d = tg.pending;
    const a = d.player === bot.eu ? bot.answer(d, tg.game) : tg.respond(d);
    const r = tg.game.answer(d.player, a);
    if (!r.ok) throw new Error(`resposta recusada: ${r.error}`);
  }
}

describe('bot heurístico', () => {
  it('joga o terreno da mão na fase principal', () => {
    const tg = setup({ hand: [['Forest', 'Island'], []], library: [['Plains'], ['Plains']] });
    const bot = new HeuristicBot('t', 0, { simulacoes: 8 });
    const a = bot.answer(tg.pending!, tg.game);
    expect(a.kind === 'priority' && a.action.startsWith('play:')).toBe(true);
  });

  it('usa a remoção na criatura do oponente, não na própria', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Elvish Mystic'], ['Glissa Sunslayer']], hand: [['Abrade'], []], library: [['Plains'], ['Plains']] });
    const bot = new HeuristicBot('t', 0, { simulacoes: 12 });
    jogar(tg, bot, (x) => x.state.zones.hand[0].length === 0 && x.state.zones.stack.length === 0);
    expect(tg.find('Glissa Sunslayer')).toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });

  it('bloqueia quando o ataque seria letal', () => {
    const tg = setup({ active: 1, battlefield: [['Wall of Omens'], [{ name: 'Gau, Feral Youth', ready: true }]], library: [['Plains'], ['Plains']] });
    tg.state.players[0].life = 3;
    tg.refresh().attack([['Gau, Feral Youth', 0]]);
    const bot = new HeuristicBot('t', 0, { simulacoes: 4 });
    jogar(tg, bot, (x) => x.state.turn.step === 'main2');
    expect(tg.life(0)).toBe(3);
  });

  it('ataca quando é seguro e não ataca para morrer', () => {
    const seguro = setup({ battlefield: [[{ name: 'Gau, Feral Youth', ready: true }], []], library: [['Plains'], ['Plains']] });
    const b1 = new HeuristicBot('t', 0, { simulacoes: 4 });
    jogar(seguro, b1, (x) => x.state.turn.step === 'main2');
    expect(seguro.life(1)).toBeLessThan(40);
    const perigo = setup({ battlefield: [[{ name: 'Elvish Mystic', ready: true }], ['Glissa Sunslayer']], library: [['Plains'], ['Plains']] });
    const b2 = new HeuristicBot('t', 0, { simulacoes: 4 });
    jogar(perigo, b2, (x) => x.state.turn.step === 'main2');
    expect(perigo.find('Elvish Mystic')).not.toBeNull();
    expect(perigo.life(1)).toBe(40);
  });

  it('num sacrifício forçado, entrega o que vale menos', () => {
    const tg = setup({ active: 1, battlefield: [['Glissa Sunslayer', 'Elvish Mystic'], ['Swamp', 'Swamp', 'Swamp']], hand: [[], ['Fleshbag Marauder']], library: [['Plains'], ['Plains']] });
    const bot = new HeuristicBot('t', 0, { simulacoes: 4 });
    tg.script.push((d, x) => (d.player === 0 && d.kind === 'select' ? bot.answer(d, x.game) : null));
    tg.cast('Fleshbag Marauder').resolve().resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Glissa Sunslayer')).not.toBeNull();
  });

  it('não insiste em atacar quem cobra para ser atacado (Ghostly Prison) sem mana para pagar', () => {
    const tg = setup({ battlefield: [[{ name: 'Gau, Feral Youth', ready: true }], ['Ghostly Prison']], library: [['Plains'], ['Plains']] });
    const bot = new HeuristicBot('t', 0, { simulacoes: 4 });
    jogar(tg, bot, (x) => x.state.turn.step === 'main2', 60);
    expect(tg.state.turn.step).toBe('main2');
    expect(tg.life(1)).toBe(40);
  });

  it('a determinização não muda a própria mão nem as quantidades escondidas', () => {
    const tg = setup({ hand: [['Forest', 'Island'], ['Plains', 'Swamp', 'Mountain']], library: [['Plains', 'Plains'], ['Island', 'Island', 'Forest']] });
    const f = determinizar(tg.game, 0, seedFrom('d'));
    expect(f.state.zones.hand[0]).toEqual(tg.state.zones.hand[0]);
    expect(f.state.zones.hand[1].length).toBe(3);
    expect(f.state.zones.library[1].length).toBe(3);
    const todas = (s: typeof tg.state) => [...s.zones.hand[1], ...s.zones.library[1]].sort();
    expect(todas(f.state)).toEqual(todas(tg.state));
    expect(avaliar(f.g, 0)).toBeCloseTo(avaliar(tg.g, 0));
  });
});
