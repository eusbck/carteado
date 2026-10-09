// Revisão dos bots: alvos pela carta de origem (texto Oracle), escolhas ordenadas (mulligan, Brainstorm) e o Jace +1.
import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from './harness.ts';
import { alternativas, escolher, HeuristicBot } from '../bots/heuristico.ts';
import { cartaDaPergunta, intencaoDoOracle } from '../bots/intencao.ts';
import { seedFrom } from '../motor/rng.ts';
import type { Answer, Decision } from '../motor/types.ts';
import type { NivelBot } from '../bots/niveis.ts';

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

const OPCOES: Partial<Record<NivelBot, { simulacoes: number; mundos?: number }>> = {
  facil: { simulacoes: 6 }, intermediario: { simulacoes: 8 }, dificil: { simulacoes: 12, mundos: 2 },
};

/** escolha de alvo como o motor pergunta (motor/stack.ts): "<carta>: escolha <alvo>" */
function alvo(tg: TestGame, carta: string, rotulo: string, nomes: string[]): Extract<Decision, { kind: 'select' }> {
  const items = nomes.map((n) => { const id = tg.bf(n); return { id: String(id), label: n, obj: id }; });
  return { kind: 'select', id: 999, player: 0, prompt: `${carta}: escolha ${rotulo}`, items, min: 1, max: 1 };
}

describe('bots: alvos pelo texto Oracle da carta de origem', () => {
  it('lê a carta na pergunta e a intenção no Oracle', () => {
    expect(cartaDaPergunta('Swords to Plowshares: escolha criatura alvo')).toBe('Swords to Plowshares');
    expect(cartaDaPergunta('Lightning Greaves (equip): escolha criatura alvo que você controla')).toBe('Lightning Greaves');
    expect(cartaDaPergunta('Jace, Multiverse Architect (−3): escolha outro planeswalker ou criatura alvo que você controla')).toBe('Jace, Multiverse Architect');
    expect(intencaoDoOracle('Swords to Plowshares', 'criatura alvo')).toBe('contra');
    expect(intencaoDoOracle('Go for the Throat', 'criatura alvo')).toBe('contra');
    expect(intencaoDoOracle('Path to Exile', 'criatura alvo')).toBe('contra');
    expect(intencaoDoOracle('Ethereal Armor', 'criatura alvo')).toBe('favor');
    expect(intencaoDoOracle('Lightning Greaves', 'criatura alvo que você controla', [], true, true)).toBe('favor');
    // Abrade: o modo escolhido decide (dano na criatura ou destruir o artefato), os dois contra
    expect(intencaoDoOracle('Abrade', 'criatura alvo', [0])).toBe('contra');
  });

  it('a heurística mira a criatura mais valiosa do oponente, e as alternativas trazem a melhor de cada lado', () => {
    const tg = setup({ battlefield: [['Plains', 'Glissa Sunslayer', 'Elvish Mystic'], ['Gau, Feral Youth', 'Grave Titan']], hand: [['Swords to Plowshares'], []] });
    const d = alvo(tg, 'Swords to Plowshares', 'criatura alvo', ['Glissa Sunslayer', 'Elvish Mystic', 'Gau, Feral Youth', 'Grave Titan']);
    const a = escolher(d, tg.g, 0, seedFrom('x'), false) as Extract<Answer, { kind: 'select' }>;
    expect(a.ids).toEqual([String(tg.bf('Grave Titan'))]);
    const alt = alternativas(d, tg.g, 0, () => true).map((x) => (x as Extract<Answer, { kind: 'select' }>).ids[0]);
    expect(alt[0]).toBe(String(tg.bf('Grave Titan')));
    expect(alt.slice(0, 3)).toContain(String(tg.bf('Glissa Sunslayer')));
    // efeito a favor (Aura que fortalece): na minha criatura mais valiosa
    const b = escolher(alvo(tg, 'Ethereal Armor', 'criatura alvo', ['Glissa Sunslayer', 'Elvish Mystic', 'Gau, Feral Youth', 'Grave Titan']), tg.g, 0, seedFrom('x'), false) as Extract<Answer, { kind: 'select' }>;
    expect(b.ids).toEqual([String(tg.bf('Glissa Sunslayer'))]);
  });

  for (const nivel of ['facil', 'intermediario', 'dificil'] as const) {
    it(`${nivel}: Swords to Plowshares na criatura do oponente, não na própria`, () => {
      const tg = setup({ battlefield: [['Plains', 'Glissa Sunslayer'], ['Grave Titan']], hand: [['Swords to Plowshares'], []], library: [['Plains'], ['Plains']] });
      const bot = new HeuristicBot('t', 0, { nivel, orcamento: 1e9, ...OPCOES[nivel] });
      jogar(tg, bot, (x) => x.state.zones.hand[0].length === 0 && x.state.zones.stack.length === 0);
      expect(tg.find('Grave Titan')).toBeNull();
      expect(tg.find('Glissa Sunslayer')).not.toBeNull();
    });
  }
});

describe('bots: escolhas da mão', () => {
  it('o Jace +1 põe no fundo a pior carta (o terreno que sobra), não a melhor', () => {
    const tg = setup({
      battlefield: [['Jace, Multiverse Architect', 'Island', 'Island', 'Island', 'Plains', 'Plains', 'Swamp'], []],
      hand: [['Island', 'Swords to Plowshares'], []], library: [['Brainstorm', 'Path to Exile', 'Plains'], ['Plains']],
    });
    const bot = new HeuristicBot('t', 0, { nivel: 'intermediario' });
    tg.script.push((d, x) => (d.player === 0 && d.kind === 'select' && d.prompt.startsWith('Jace: escolha uma carta') ? bot.answer(d, x.game) : null));
    tg.activate('Jace, Multiverse Architect', '+1').resolve();
    const grim = tg.names(0, 'library');
    expect(grim[grim.length - 1]).toBe('Island');
    expect(tg.names(0, 'hand').sort()).toEqual(['Brainstorm', 'Path to Exile', 'Swords to Plowshares']);
  });

  it('Brainstorm devolve as duas piores (terrenos de sobra) e não as remoções', () => {
    const tg = setup({
      battlefield: [['Island', 'Island', 'Island', 'Plains', 'Plains', 'Swamp'], []],
      hand: [['Brainstorm', 'Island', 'Swords to Plowshares'], []], library: [['Plains', 'Path to Exile', 'Go for the Throat', 'Swamp'], ['Plains']],
    });
    const bot = new HeuristicBot('t', 0, { nivel: 'intermediario' });
    tg.script.push((d, x) => (d.player === 0 && d.kind === 'select' && d.prompt.startsWith('Brainstorm') ? bot.answer(d, x.game) : null));
    tg.cast('Brainstorm').resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Go for the Throat', 'Path to Exile', 'Swords to Plowshares']);
  });

  it('mulligan de Londres: põe no fundo terrenos de sobra ou a mágica mais cara', () => {
    const fundo = (mao: string[], k: number): string[] => {
      const tg = setup({ hand: [mao, []] });
      const items = tg.state.zones.hand[0].map((id) => ({ id: String(id), label: tg.state.objects[id].def, obj: id }));
      const d: Decision = { kind: 'select', id: 1, player: 0, prompt: `Escolha ${k} carta(s) para pôr no fundo do grimório`, items, min: k, max: k, ordered: true };
      const a = escolher(d, tg.g, 0, seedFrom('m'), false) as Extract<Answer, { kind: 'select' }>;
      return a.ids.map((id) => tg.state.objects[Number(id)].def);
    };
    expect(fundo(['Island', 'Island', 'Plains', 'Swamp', 'Island', 'Swords to Plowshares', 'Brainstorm'], 2)).toEqual(['Island', 'Island']); // terrenos repetidos, as cores ficam
    expect(fundo(['Island', 'Plains', 'Sol Ring', 'Swords to Plowshares', 'Archon of Cruelty', 'Brainstorm', 'Path to Exile'], 1)).toEqual(['Archon of Cruelty']);
  });
});

describe('bots: escolhas sobre cartas escondidas', () => {
  it('a vidência é decidida sobre a carta de verdade do topo, não pelo plano feito sobre a carta sorteada', () => {
    const tg = setup({
      battlefield: [['Island', 'Mountain'], []], hand: [['Temple of Epiphany'], []],
      library: [['Island', ...Array(9).fill('Archon of Cruelty')], ['Plains']],
    });
    const bot = new HeuristicBot('t', 0, { nivel: 'intermediario', orcamento: 1e9, simulacoes: 8 });
    let resposta: Answer | null = null;
    tg.script.push((d, x) => {
      if (d.kind !== 'arrange' || d.player !== 0) return null;
      // o plano de uma simulação em que o topo sorteado era um Archon: para o fundo
      const id = d.items[0].id;
      bot.e.plano = [{ kind: 'arrange', placement: { [id]: 'bottom' }, order: [id] }];
      resposta = bot.answer(d, x.game);
      return resposta;
    });
    tg.play('Temple of Epiphany').resolveAll();
    expect(resposta).not.toBeNull();
    // poucos terrenos: o Island de verdade fica no topo
    expect(tg.state.objects[tg.state.zones.library[0][0]].def).toBe('Island');
    expect(bot.e.plano).toEqual([]);
  });

  it('uma escolha pública do plano (alvo no campo) continua seguindo o plano', () => {
    const tg = setup({ battlefield: [['Plains', 'Glissa Sunslayer'], ['Grave Titan', 'Gau, Feral Youth']], hand: [['Swords to Plowshares'], []] });
    const bot = new HeuristicBot('t', 0, { nivel: 'intermediario' });
    tg.script.push((d, x) => {
      if (d.kind !== 'select' || d.player !== 0) return null;
      bot.e.plano = [{ kind: 'select', ids: [String(tg.bf('Gau, Feral Youth'))] }];
      return bot.answer(d, x.game);
    });
    tg.cast('Swords to Plowshares').resolve();
    expect(tg.find('Gau, Feral Youth')).toBeNull();
  });
});
