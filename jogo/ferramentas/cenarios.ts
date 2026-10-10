// Salas prontas numa situação de jogo, para as capturas de tela: bots jogam por todos os assentos
// até a situação pedida e a partida é gravada no banco; o servidor retoma a sala e o assento 0
// fica para a pessoa no navegador (entra com o token `token-<CÓDIGO>`).

import '../cartas/index.ts';
import decksJson from '../gerado/decks.json' with { type: 'json' };
import { HeuristicBot } from '../bots/heuristico.ts';
import { defaultAnswer } from '../motor/ask.ts';
import { PARADAS_PADRAO } from '../servidor/salas.ts';
import { Game } from '../motor/game.ts';
import { buildView } from '../motor/view.ts';
import type { DeckList } from '../motor/state.ts';
import type { Decision, GameConfig, ObjId, PlayerId, Step } from '../motor/types.ts';
import type { Banco } from '../servidor/banco.ts';
import { setup, type SetupOptions, type TestGame } from '../testes/harness.ts';

const DECKS = decksJson as DeckList[];

interface Cenario {
  codigo: string;
  modo: '4p' | '1v1';
  decks: number[];
  /** sementes conhecidas que chegam na situação (as seguintes são tentadas se o motor mudar) */
  sementes: string[];
  minTurno: number;
  pred: (g: Game, d: Decision) => boolean;
}

export const CENARIOS: Cenario[] = [
  // Ana declara atacantes em 4 jogadores, com pelo menos 3 criaturas que podem atacar
  { codigo: 'ATACA', modo: '4p', decks: [0, 2, 4, 5], sementes: ['prototipo8-ATACA-7'], minTurno: 9, pred: (g, d) => d.player === 0 && d.kind === 'attackers' && d.candidates.length >= 3 },
  // Ana declara bloqueadores num 1v1, com pelo menos 2 criaturas que podem bloquear
  { codigo: 'BLOQU', modo: '1v1', decks: [3, 1], sementes: ['prototipo8-BLOQU-0'], minTurno: 7, pred: (g, d) => d.player === 0 && d.kind === 'blockers' && d.candidates.filter((c) => c.canBlock.length).length >= 2 },
  // fase 9: Ana ataca e ordena pelo menos três gatilhos (a janela de escolha em fila); depois a busca e a vidência pelo ajuste manual
  { codigo: 'ORDEM', modo: '1v1', decks: [4, 0], sementes: ['gatilhos-1v1-4-0'], minTurno: 10, pred: (g, d) => d.player === 0 && d.kind === 'select' && !!d.ordered && d.min === d.items.length && d.items.length >= 3 },
  // fase 9: Ana no começo da própria fase principal, com pelo menos 7 permanentes para arrumar (3 terrenos
  // desvirados) e um terreno na mão para arrastar até o campo
  { codigo: 'ARRUM', modo: '1v1', decks: [0, 1], sementes: ['fase9-ARRUM-0'], minTurno: 7, pred: (g, d) => {
    if (d.player !== 0 || d.kind !== 'priority' || g.state.turn.active !== 0 || g.state.turn.step !== 'main1' || g.state.turn.landsPlayed > 0) return false;
    const v = buildView(g.g, 0, d);
    const minhas = v.battlefield.filter((o) => o.controller === 0);
    return minhas.length >= 7 && minhas.filter((o) => o.types.includes('Land') && !o.tapped).length >= 3 && v.hand.some((o) => o.types.includes('Land'));
  } },
];

/** grava as salas pedidas no banco; devolve os códigos que ficaram prontos */
export function gerarSalas(banco: Banco, codigos: string[]): string[] {
  const prontas: string[] = [];
  for (const c of CENARIOS.filter((x) => codigos.includes(x.codigo))) {
    const sementes = [...c.sementes, ...Array.from({ length: 10 }, (_, k) => `${c.codigo}-extra-${k}`)];
    for (const seed of sementes) {
      const nomes = c.modo === '4p' ? ['Ana', 'Bruno', 'Caio', 'Dani'] : ['Ana', 'Bruno'];
      const config: GameConfig = { seed, players: nomes.map((name, i) => ({ name, deckId: DECKS[c.decks[i]].id })), startingLife: 40, turnLimit: null, multiplayer: c.modo === '4p', manualMode: true, mulligan: 'londres' };
      const decks = c.decks.map((i) => DECKS[i]);
      const game = Game.create(config, decks);
      const bots = nomes.map((_, i) => new HeuristicBot(`${seed}:${i}`, i, { simulacoes: 4 }));
      let chegou = false;
      for (let k = 0; k < 20000 && game.pending && !game.isOver(); k++) {
        const d = game.pending;
        if (game.state.turn.number >= c.minTurno && c.pred(game, d)) { chegou = true; break; }
        if (game.state.turn.number > c.minTurno + 10) break;
        const r = game.answer(d.player, bots[d.player].answer(d, game));
        if (!r.ok) game.answer(d.player, defaultAnswer(d));
      }
      if (!chegou) continue;
      const assentos = nomes.map((nome, i) => ({ tipo: i === 0 ? 'humano' : 'bot', nome, deck: DECKS[c.decks[i]].id, token: i === 0 ? `token-${c.codigo}` : null, paradas: structuredClone(PARADAS_PADRAO) }));
      banco.salvarSala(c.codigo, { codigo: c.codigo, senha: '00:00', modo: c.modo, estado: 'jogando', assentos, anfitriao: 0, partida: { config, deckIds: decks.map((d) => d.id), checkpoint: null, posicoes: {} }, mulligan: 'londres' });
      banco.adicionarEntradas(c.codigo, 0, game.inputs);
      prontas.push(c.codigo);
      break;
    }
  }
  return prontas;
}

// --- combate com muitas fichas: salas fixas, montadas com o arcabouço de testes (sem depender de sementes) ---
const ficha = (n: number) => Array.from({ length: n }, () => ({ name: 'Goblin', token: true }));
const terrenos = (n: number) => Array.from({ length: n }, () => 'Forest');

/** a partida montada vai para o banco a partir de um checkpoint (numa prioridade); o assento 0 é a pessoa */
function salvarFixa(banco: Banco, codigo: string, tg: TestGame, decks: number[], minhasParadas: Step[] = ['main2']): void {
  const cp = tg.game.checkpoint();
  if (!cp) throw new Error(`sala ${codigo}: a partida montada não parou numa prioridade`);
  const deckIds = decks.map((i) => DECKS[i].id);
  // a pessoa não para no começo do combate nem no turno dos outros: a sala abre direto na decisão de combate
  const paradas = { ...structuredClone(PARADAS_PADRAO), myTurn: minhasParadas, othersTurn: [], skipWhenNothing: false };
  banco.salvarSala(codigo, {
    codigo, senha: '00:00', modo: decks.length === 4 ? '4p' : '1v1', estado: 'jogando', anfitriao: 0, mulligan: 'londres',
    assentos: decks.map((d, i) => ({ tipo: i === 0 ? 'humano' : 'bot', nome: tg.state.players[i].name, deck: DECKS[d].id, token: i === 0 ? `token-${codigo}` : null, paradas: structuredClone(paradas) })),
    partida: { config: tg.state.config, deckIds, checkpoint: cp, posicoes: {} },
  });
}

/** os ids que as capturas conferem, por sala */
export interface IdsCombate {
  /** FICHA: as seis fichas de Ana e as duas criaturas dela */
  FICHA: { fichas: ObjId[]; criaturas: ObjId[] };
  /** BLOQT: as fichas de Bruno que atacam Ana (e as que atacam Diego), a criatura com ameaça, e as de Ana */
  BLOQT: { contraAna: ObjId[]; contraDiego: ObjId[]; ameaca: ObjId; kami: ObjId; ancients: ObjId; fichasAna: ObjId[] };
}

/**
 * FICHA (4 jogadores): Ana declara atacantes com seis fichas de Goblin 1/1 iguais e duas criaturas. BLOQT (4
 * jogadores): Bruno ataca Ana com três fichas de Goblin iguais e a Defiling Daemogoth (ameaça), e Diego com outras
 * duas fichas; Ana declara bloqueadores com duas fichas, o Kami e o Indomitable Ancients.
 */
export function gerarSalasCombate(banco: Banco): IdsCombate {
  const base = (o: SetupOptions): SetupOptions => ({ players: 4, step: 'beginCombat', library: [0, 1, 2, 3].map(() => terrenos(6)), ...o });
  const doJogador = (tg: TestGame, nome: string, p: PlayerId) => tg.all(nome).filter((id) => tg.state.objects[id].controller === p);

  const f = setup(base({ active: 0, battlefield: [
    [...ficha(6), 'Kami of Ancient Law', 'Goblin Electromancer', ...terrenos(4)],
    ['Indomitable Ancients', ...terrenos(3)], ['Kami of Ancient Law', ...terrenos(3)], ['Goblin Electromancer', ...terrenos(3)],
  ] }));
  salvarFixa(banco, 'FICHA', f, [0, 2, 4, 5]);

  const b = setup(base({ active: 1, battlefield: [
    [...ficha(2), 'Kami of Ancient Law', 'Indomitable Ancients', ...terrenos(4)],
    [...ficha(5), 'Defiling Daemogoth', ...terrenos(4)], ['Goblin Electromancer', ...terrenos(3)], [...terrenos(3)],
  ] }));
  const deBruno = doJogador(b, 'Goblin', 1);
  const ameaca = b.bf('Defiling Daemogoth');
  b.attack([...deBruno.slice(0, 3).map((id) => [id, 0] as [ObjId, PlayerId]), [ameaca, 0], ...deBruno.slice(3).map((id) => [id, 3] as [ObjId, PlayerId])]);
  b.passUntil((x) => x.state.turn.step === 'declareAttackers');
  if (b.state.combat?.attackers.length !== 6) throw new Error('sala BLOQT: o ataque não ficou declarado');
  salvarFixa(banco, 'BLOQT', b, [0, 2, 4, 5]);

  return {
    FICHA: { fichas: doJogador(f, 'Goblin', 0), criaturas: [f.bf('Kami of Ancient Law', 0), f.bf('Goblin Electromancer', 0)] },
    BLOQT: { contraAna: deBruno.slice(0, 3), contraDiego: deBruno.slice(3), ameaca, kami: b.bf('Kami of Ancient Law', 0), ancients: b.bf('Indomitable Ancients', 0), fichasAna: doJogador(b, 'Goblin', 0) },
  };
}

// --- a sua área com o campo até a base, a mão por cima e os terrenos deitados: salas fixas ---
/** os ids que as capturas conferem: o terreno da mão que vai ser jogado e uma peça deitada de pé no campo */
export interface IdsMesa { MESA1: { arrastar: ObjId; deitada: ObjId }; MESA4: { duploClique: ObjId } }

/**
 * MESA1 (um contra um) e MESA4 (4 jogadores): Ana na fase principal 1 dela, com criaturas, fichas, artefatos e terrenos
 * (iguais e diferentes, alguns virados) no campo e sete cartas na mão, duas delas terrenos. Ela para na principal 1.
 */
export function gerarSalasMesa(banco: Banco): IdsMesa {
  const campoAna = [
    'Kami of Ancient Law', 'Indomitable Ancients', 'Goblin Electromancer', 'Arboreal Grazer', 'Elvish Mystic', 'Drumbellower', ...ficha(3),
    'Sol Ring', 'Arcane Signet',
    'Forest', { name: 'Forest', tapped: true }, 'Forest', { name: 'Forest', tapped: true }, 'Island', 'Island', { name: 'Island', tapped: true },
    'Command Tower', 'Exotic Orchard', { name: 'Llanowar Wastes', tapped: true }, 'Reliquary Tower', 'Path of Ancestry',
  ];
  const maoAna = ['Island', 'Forest', 'Cultivate', 'Path to Exile', 'Kami of Ancient Law', 'Temple of Plenty', 'Sol Ring'];
  const oponente = ['Kami of Ancient Law', 'Goblin Electromancer', 'Swamp', 'Swamp', { name: 'Swamp', tapped: true }, 'Command Tower', 'Evolving Wilds'];
  const base = (n: number): SetupOptions => ({ players: n, step: 'main1', active: 0, library: Array.from({ length: n }, () => terrenos(6)), hand: [maoAna], battlefield: [campoAna, ...Array.from({ length: n - 1 }, () => oponente)] });
  const um = setup(base(2));
  salvarFixa(banco, 'MESA1', um, [0, 1], ['main1', 'main2']);
  const quatro = setup(base(4));
  salvarFixa(banco, 'MESA4', quatro, [0, 2, 4, 5], ['main1', 'main2']);
  const naMao = (tg: TestGame, nome: string) => tg.find(nome, 'hand', 0)!;
  return {
    MESA1: { arrastar: naMao(um, 'Island'), deitada: um.all('Command Tower').find((id) => um.state.objects[id].controller === 0)! },
    MESA4: { duploClique: naMao(quatro, 'Forest') },
  };
}
