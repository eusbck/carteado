// Modos de jogo (motor/modos.ts): Commander e Standard.
//  - validação do deck de Standard (CR 100.2a: 60 cartas ou mais, até 4 cópias fora os básicos e as cartas sem limite;
//    MTR 3.3: só cartas legais);
//  - a partida de Standard começa com 20 de vida e sem nada na zona de comando;
//  - o Moxfield diz o modo do deck (com comandante: Commander; sem, o formato `standard`);
//  - a sala tem um modo: ao criar, no passo Regras (só o anfitrião), e o saguão só aceita os decks dele.
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import { limiteDeCopias, validateDeck } from '../motor/deck.ts';
import { Game } from '../motor/game.ts';
import { MODOS, modoDe } from '../motor/modos.ts';
import { oracle, type OracleCard } from '../motor/oracle.ts';
import type { DeckList } from '../motor/state.ts';
import type { GameConfig } from '../motor/types.ts';
import { Banco } from '../servidor/banco.ts';
import { normalizar } from '../servidor/catalogo/moxfield.ts';
import { validarLista } from '../servidor/catalogo/validar.ts';
import type { MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';
import { respostaMox } from './catalogo/ajuda.ts';

const COMMANDER = decksJson as DeckList[];

/** quatro cópias das primeiras cartas que não são terreno de um deck de teste, e Forest até 60 */
function deckStandard(id = 'std1', nome = 'Standard de teste'): DeckList {
  const fonte = COMMANDER[0].cartas.filter((e) => !oracle(e.nome).faces[0].types.includes('Land')).slice(0, 9);
  const cartas = fonte.map((e) => ({ nome: e.nome, quantidade: 4 }));
  return { id, nome, formato: 'standard', cartas: [...cartas, { nome: 'Forest', quantidade: 60 - cartas.length * 4 }] };
}

describe('modos: tabela', () => {
  it('Commander com 40 de vida e comandante; Standard com 20, sem comandante', () => {
    expect(MODOS.commander).toMatchObject({ vida: 40, comandante: true });
    expect(MODOS.standard).toMatchObject({ vida: 20, comandante: false });
  });
  it('deck ou sala sem a chave é de Commander', () => {
    expect(modoDe({})).toBe('commander');
    expect(modoDe(null)).toBe('commander');
    expect(modoDe({ formato: 'standard' })).toBe('standard');
  });
});

describe('validação do deck de Standard', () => {
  it('60 cartas com até 4 cópias: sem problemas', () => {
    expect(validateDeck(deckStandard())).toEqual([]);
  });

  it('menos de 60 cartas, mais de 4 cópias e comandante são recusados', () => {
    const d = deckStandard();
    const curto = { ...d, cartas: d.cartas.slice(0, -1) };
    expect(validateDeck(curto).map((p) => p.message).join()).toMatch(/precisa de pelo menos 60/);
    const cinco = { ...d, cartas: d.cartas.map((e, i) => (i === 0 ? { ...e, quantidade: 5 } : e)) };
    expect(validateDeck(cinco).map((p) => p.message).join()).toMatch(/aparece 5 vezes \(no máximo 4\)/);
    // a mesma carta em duas linhas (edições diferentes) conta junto
    const duas = { ...d, cartas: [...d.cartas, { nome: d.cartas[0].nome, quantidade: 1 }] };
    expect(validateDeck(duas).map((p) => p.rule)).toContain('100.2a');
    expect(validateDeck({ ...d, comandante: COMMANDER[0].comandante }).map((p) => p.message).join()).toMatch(/não tem comandante/);
  });

  it('terrenos básicos e cartas que dizem "any number" não têm limite; "up to seven" tem', () => {
    const carta = (texto: string, basico = false): OracleCard => ({
      name: 'X', oracleId: 'x', layout: 'normal', manaValue: 1, colorIdentity: [], keywords: [],
      faces: [{ name: 'X', manaCost: '', typeLine: '', supertypes: basico ? ['Basic'] : [], types: basico ? ['Land'] : ['Creature'], subtypes: [], oracleText: texto, power: 1, toughness: 1, loyalty: null, colors: [], colorIndicator: null } as never],
    });
    expect(limiteDeCopias(carta('', true))).toBe(Infinity);
    expect(limiteDeCopias(carta('A deck can have any number of cards named Relentless Rats.'))).toBe(Infinity);
    expect(limiteDeCopias(carta('A deck can have up to seven cards named Seven Dwarves.'))).toBe(7);
    expect(limiteDeCopias(carta('Flying'))).toBe(4);
  });

  it('cartas banidas ou fora do Standard (legalidade do Scryfall) são recusadas', () => {
    const d = deckStandard();
    const alvo = d.cartas[0].nome;
    const leg = (estado: string) => (n: string, f: string) => (f === 'standard' && n === alvo ? estado : 'legal');
    expect(validateDeck(d, oracle, leg('banned')).map((p) => p.message)).toEqual([`${alvo} está banida no Standard`]);
    expect(validateDeck(d, oracle, leg('not_legal')).map((p) => p.message)).toEqual([`${alvo} não é legal no Standard`]);
    expect(validateDeck(d, oracle, leg('legal'))).toEqual([]);
  });

  it('a importação (validarLista) usa a legalidade como erro no Standard e como aviso no Commander', () => {
    const d = deckStandard();
    const alvo = d.cartas[0].nome;
    const r = validarLista({ formato: 'standard', cartas: d.cartas }, oracle, { legalidade: (n) => (n === alvo ? 'not_legal' : 'legal') });
    expect(r.erros.join()).toMatch(/não é legal no Standard — MTR 3.3/);
    expect(r.avisos).toEqual([]);
  });

  it('os decks de Commander continuam validando como antes', () => {
    for (const d of COMMANDER) expect(validateDeck(d), d.nome).toEqual([]);
    expect(validateDeck({ id: 'x', nome: 'x', cartas: COMMANDER[0].cartas }).map((p) => p.message)).toEqual(['O deck de Commander precisa de um comandante']);
  });
});

describe('partida de Standard', () => {
  const config = (decks: DeckList[]): GameConfig => ({
    seed: 'modos-1', players: decks.map((d, i) => ({ name: `J${i}`, deckId: d.id })), startingLife: MODOS.standard.vida,
    turnLimit: null, multiplayer: false, formato: 'standard',
  });

  it('começa com 20 de vida, 60 cartas no grimório (menos a mão) e a zona de comando vazia', () => {
    const decks = [deckStandard('a'), deckStandard('b')];
    const game = Game.create(config(decks), decks);
    const s = game.state;
    expect(s.zones.command).toEqual([]);
    for (const p of s.players) {
      expect(p.life).toBe(20);
      expect(p.commanders).toEqual([]);
      expect(s.zones.library[p.id].length + s.zones.hand[p.id].length).toBe(60);
    }
    expect(game.pending?.player).toBeTypeOf('number'); // chegou ao mulligan
  });
});

describe('Moxfield: o modo do deck', () => {
  it('com comandante é Commander; sem comandante e formato standard é Standard (com a carta de destaque)', () => {
    const cmd = respostaMox('Teste12345', 'T', { nome: 'Jace' }, [{ nome: 'Opt' }]);
    expect(normalizar(cmd, 'x').modo).toBe('commander');
    const std = respostaMox('Teste12345', 'T', { nome: 'Jace' }, [{ nome: 'Opt', quantidade: 4 }, { nome: 'Island', quantidade: 56 }], { format: 'standard', main: { name: 'Opt' } });
    std.boards.commanders.cards = {};
    const n = normalizar(std, 'x');
    expect(n.modo).toBe('standard');
    expect(n.comandantes).toEqual([]);
    expect(n.destaque).toBe('Opt');
  });

  it('sem comandante e outro formato: recusa dizendo os modos que o jogo tem', () => {
    const r = respostaMox('Teste12345', 'T', { nome: 'Jace' }, [{ nome: 'Opt' }], { format: 'modern' });
    r.boards.commanders.cards = {};
    expect(() => normalizar(r, 'x')).toThrow(/formato modern no Moxfield; o jogo tem os modos Commander e Standard/);
  });
});

// ------------------------------------------------------------------------------------------------ sala

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  msgs: MsgServidor[] = [];
  enviar(m: MsgServidor) { this.msgs.push(m); }
  ultima<T extends MsgServidor['t']>(t: T): Extract<MsgServidor, { t: T }> | undefined {
    return [...this.msgs].reverse().find((m) => m.t === t) as Extract<MsgServidor, { t: T }> | undefined;
  }
}
const espera = () => new Promise((r) => setTimeout(r, 0));

describe('sala: modo de jogo', () => {
  const STD = [deckStandard('std1', 'Verde'), deckStandard('std2', 'Verde 2')];
  const gerente = () => new Gerente(new Banco(':memory:'), [...COMMANDER, ...STD], SEM_ATRASO);

  it('sem modo na criação é Commander, com 4 lugares; Standard sugere o duelo', async () => {
    const g = gerente();
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo' });
    await espera();
    expect(ana.ultima('sala')!.sala).toMatchObject({ formato: 'commander' });
    expect(ana.ultima('sala')!.sala.assentos).toHaveLength(4);
    const bia = new Falsa();
    g.tratar(bia, { t: 'criar', nome: 'Bia', senhaSala: 'segredo', formato: 'standard' });
    await espera();
    expect(bia.ultima('sala')!.sala).toMatchObject({ formato: 'standard' });
    expect(bia.ultima('sala')!.sala.assentos).toHaveLength(2);
    const cid = new Falsa();
    g.tratar(cid, { t: 'criar', nome: 'Cid', senhaSala: 'segredo', formato: 'vintage' as never });
    expect(cid.ultima('erro')?.msg).toBe('Modo de jogo desconhecido');
  });

  it('recusa deck de outro modo (pessoa e bot) e começa a partida de Standard com 20 de vida', async () => {
    const g = gerente();
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', formato: 'standard' });
    g.tratar(ana, { t: 'deck', deck: COMMANDER[0].id });
    expect(ana.ultima('erro')?.msg).toBe('Esse deck é de Commander; a sala é de Standard');
    g.tratar(ana, { t: 'bot', assento: 1, deck: COMMANDER[1].id });
    expect(ana.ultima('erro')?.msg).toBe('Esse deck é de Commander; a sala é de Standard');
    g.tratar(ana, { t: 'deck', deck: 'std1' });
    g.tratar(ana, { t: 'bot', assento: 1, deck: 'std2' });
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    const sala = [...g.salas.values()][0];
    expect(sala.publica().estado).toBe('jogando');
    const s = sala.game!.state;
    expect(s.players.map((p) => p.life)).toEqual([20, 20]);
    expect(s.config.formato).toBe('standard');
    expect(s.zones.command).toEqual([]);
  });

  it('o anfitrião troca o modo no saguão: as pessoas perdem o deck do outro modo, os bots ganham um do modo novo', async () => {
    const g = gerente();
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', lugares: 2 });
    const codigo = ana.ultima('sala')!.sala.codigo;
    g.tratar(ana, { t: 'deck', deck: COMMANDER[0].id });
    g.tratar(ana, { t: 'bot', assento: 1, deck: COMMANDER[1].id });
    g.tratar(ana, { t: 'formato', formato: 'standard' });
    await espera();
    const pub = g.salas.get(codigo)!.publica();
    expect(pub.formato).toBe('standard');
    expect(pub.assentos[0].deck).toBeNull();
    expect(['std1', 'std2']).toContain(pub.assentos[1].deck);
  });

  it('só o anfitrião troca o modo, e não com a partida em andamento', async () => {
    const g = gerente();
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    const bruno = new Falsa();
    g.tratar(bruno, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Bruno' });
    g.tratar(bruno, { t: 'formato', formato: 'standard' });
    expect(bruno.ultima('erro')?.msg).toBe('Só quem criou a sala escolhe o modo de jogo');
    g.tratar(ana, { t: 'formato', formato: 'pauper' as never });
    expect(ana.ultima('erro')?.msg).toBe('Modo de jogo desconhecido');
    await espera();
    expect(g.salas.get(codigo)!.publica().formato).toBe('commander');
  });
});
