// Bots: escolhas em segredo não são simuladas (seria espiar) e o milagre de varredura só vale contra os oponentes.
import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from './harness.ts';
import { escolher, HeuristicBot } from '../bots/heuristico.ts';
import { ocultar } from '../bots/mundo.ts';
import { papelDe } from '../bots/papeis.ts';
import { G } from '../motor/game-context.ts';
import { seedFrom } from '../motor/rng.ts';
import type { Answer, Decision } from '../motor/types.ts';

type Select = Extract<Decision, { kind: 'select' }>;

/** a pergunta de milagre como o motor faz (motor/milagre.ts) */
function milagre(tg: TestGame, carta: string): Select {
  return {
    kind: 'select', id: 999, player: 0, prompt: `Milagre: conjurar ${carta} por {W}? (senão, ela fica na mão)`,
    items: [{ id: 'yes', label: 'Sim' }, { id: 'no', label: 'Não' }], min: 1, max: 1, about: tg.find(carta, 'hand', 0)!,
  };
}
const resposta = (a: Answer) => (a as Extract<Answer, { kind: 'select' }>).ids[0];

describe('bots: milagre de varredura', () => {
  it('Terminus conta como varredura', () => {
    expect(papelDe('Terminus').papeis.has('varredura')).toBe(true);
  });

  it('Terminus por milagre só quando as criaturas dos oponentes valem mais que as minhas', () => {
    const contra = setup({ battlefield: [['Grave Titan', 'Glissa Sunslayer'], ['Elvish Mystic']], hand: [['Terminus'], []] });
    expect(resposta(escolher(milagre(contra, 'Terminus'), contra.g, 0, seedFrom('x'), false))).toBe('no');
    const a_favor = setup({ battlefield: [['Elvish Mystic'], ['Grave Titan', 'Glissa Sunslayer']], hand: [['Terminus'], []] });
    expect(resposta(escolher(milagre(a_favor, 'Terminus'), a_favor.g, 0, seedFrom('x'), false))).toBe('yes');
  });

  it('milagre que não é varredura continua sendo conjurado', () => {
    const tg = setup({ battlefield: [['Grave Titan'], []], hand: [['Entreat the Angels'], []] });
    expect(resposta(escolher(milagre(tg, 'Entreat the Angels'), tg.g, 0, seedFrom('x'), false))).toBe('yes');
  });

  it('as duas perguntas do milagre dizem de qual carta se trata', () => {
    const tg = setup({ battlefield: [['Plains', 'Elvish Mystic'], ['Grave Titan']], library: [['Terminus'], []], step: 'upkeep' });
    // a carta de cada pergunta, olhada na hora da pergunta (depois ela é conjurada e vira outro objeto)
    const cartas: (string | undefined)[] = [];
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.startsWith('Milagre:')) cartas.push(d.about === undefined ? undefined : tg.state.objects[d.about]?.def); return null; });
    tg.passTo('main1');
    expect(cartas).toEqual(['Terminus', 'Terminus']);
  });
});

describe('bots: escolhas em segredo', () => {
  it("Prisoner's Dilemma pergunta em segredo", () => {
    const tg = setup({ players: 3, battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], [], []], hand: [["Prisoner's Dilemma"], [], []] });
    const perguntas: Select[] = [];
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.startsWith("Prisoner's Dilemma")) perguntas.push(d); return null; });
    tg.cast("Prisoner's Dilemma").resolve();
    expect(perguntas.map((p) => [p.player, p.secret])).toEqual([[1, true], [2, true]]);
  });

  it('o Difícil não simula a escolha em segredo (a cópia refaria a partida com a escolha de quem veio antes)', () => {
    const tg = setup({ players: 3, battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], [], []], hand: [["Prisoner's Dilemma"], [], []], library: [['Mountain'], ['Mountain'], ['Mountain']] });
    const bot = new HeuristicBot('segredo', 2, { nivel: 'dificil', simulacoes: 4, mundos: 2 });
    let simulou = 0;
    (bot as unknown as { escolhaSimulada: () => Answer }).escolhaSimulada = () => { simulou++; return { kind: 'select', ids: ['delatar'] }; };
    const visto: { secret?: boolean; semMarca?: number; comMarca?: number; resposta?: string } = {};
    // a escolha do segundo oponente, respondida pelo bot na hora (a do primeiro é Silêncio)
    tg.script.push((d) => {
      if (d.kind !== 'select' || d.player !== 2 || !d.prompt.startsWith("Prisoner's Dilemma")) return null;
      visto.secret = d.secret;
      // sem a marca de segredo, a mesma escolha seria simulada (o teste confere que o caminho existe)
      bot.answer({ ...d, secret: false } as Decision, tg.game);
      visto.semMarca = simulou;
      const a = bot.answer(d, tg.game);
      visto.comMarca = simulou;
      visto.resposta = resposta(a);
      return a;
    });
    tg.choose("Prisoner's Dilemma", ['Silêncio']);
    // o bot acompanha a partida desde a última decisão de prioridade (é de lá que ele a refaz para simular)
    bot.rastro.observar(tg.game);
    tg.cast("Prisoner's Dilemma").resolve();
    expect(visto.secret).toBe(true);
    expect(visto.semMarca).toBe(1);
    expect(visto.comMarca).toBe(1);
    expect(['silencio', 'delatar']).toContain(visto.resposta);
  });

  it('Stalking Leonin: nos mundos dos outros, o oponente escolhido é sorteado; no do dono, fica', () => {
    const tg = setup({ players: 3, battlefield: [['Stalking Leonin'], [], []] });
    const id = tg.bf('Stalking Leonin');
    tg.state.objects[id].data.leoninEscolhido = 1;
    const escolhidoNoMundo = (eu: number, semente: string) => {
      const g = new G(structuredClone(tg.state));
      ocultar(g, eu, seedFrom(semente));
      return g.state.objects[id].data.leoninEscolhido;
    };
    const vistos = new Set(Array.from({ length: 20 }, (_, i) => escolhidoNoMundo(2, `m${i}`)));
    expect([...vistos].sort()).toEqual([1, 2]);
    for (let i = 0; i < 5; i++) expect(escolhidoNoMundo(0, `m${i}`)).toBe(1);
    // depois de revelado, todos sabem
    tg.state.objects[id].data.leoninUsado = true;
    for (let i = 0; i < 5; i++) expect(escolhidoNoMundo(2, `m${i}`)).toBe(1);
  });
});
