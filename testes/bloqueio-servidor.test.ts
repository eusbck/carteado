// Fase 9, item 1.4: o bloqueio no servidor, com bots de verdade e uma pessoa (conexão falsa). A sala começa de um
// checkpoint montado com o arcabouço de testes (o combate já declarado), então a situação é sempre a mesma.
import { describe, expect, it } from 'vitest';
import decksJson from '../gerado/decks.json' with { type: 'json' };
import { cliqueBloqueio, respostaBloqueio, type EstadoBloqueio } from '../cliente/src/mesa/bloqueio.ts';
import { DEFAULT_STOPS } from '../motor/autopass.ts';
import type { DeckList } from '../motor/state.ts';
import type { Decision, ObjId, PlayerId, TargetRef } from '../motor/types.ts';
import type { GameView } from '../motor/view.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';
import { setup, type SetupOptions } from './harness.ts';

const DECKS = decksJson as DeckList[];

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  msgs: MsgServidor[] = [];
  enviar(m: MsgServidor) { this.msgs.push(m); }
  ultima<T extends MsgServidor['t']>(t: T): Extract<MsgServidor, { t: T }> | undefined {
    return [...this.msgs].reverse().find((m) => m.t === t) as Extract<MsgServidor, { t: T }> | undefined;
  }
  get vista(): GameView { return this.ultima('jogo')!.vista; }
  /** todas as vistas recebidas */
  vistas(): GameView[] { return this.msgs.flatMap((m) => (m.t === 'jogo' ? [m.vista] : [])); }
}

type DBloqueio = Extract<Decision, { kind: 'blockers' }>;

/**
 * Sala retomada de um checkpoint no meio do combate: os atacantes já declarados, com a prioridade na etapa de
 * declarar atacantes. O assento 0 é a pessoa; ela para na fase principal 2 do próprio turno e na etapa final dos
 * outros, mesmo sem jogada (como na mesa real).
 */
function salaEmCombate(o: SetupOptions, ataques: [string, PlayerId | TargetRef][], tipos: ('humano' | 'bot')[]) {
  const tg = setup({ step: 'beginCombat', players: tipos.length, library: tipos.map(() => ['Forest', 'Forest', 'Forest', 'Forest']), ...o });
  tg.attack(ataques);
  tg.passUntil((x) => x.state.turn.step === 'declareAttackers');
  const nomes = (n: string, p?: number) => tg.bf(n, p);
  const banco = new Banco(':memory:');
  const codigo = 'BLOQ9';
  const deckIds = tipos.map((_, i) => DECKS[i].id);
  banco.salvarSala(codigo, {
    codigo, senha: '00:00', modo: tipos.length === 4 ? '4p' : '1v1', estado: 'jogando', anfitriao: 0, mulligan: 'londres',
    assentos: tipos.map((tipo, i) => ({
      tipo, nome: tg.state.players[i].name, deck: deckIds[i], token: tipo === 'humano' ? `token-${i}` : null,
      paradas: { ...DEFAULT_STOPS, myTurn: ['main2'], othersTurn: ['end'], skipWhenNothing: false },
    })),
    partida: { config: tg.state.config, deckIds, checkpoint: tg.game.checkpoint(), posicoes: {} },
  });
  const g = new Gerente(banco, DECKS, SEM_ATRASO);
  g.restaurar();
  const ana = new Falsa();
  g.tratar(ana, { t: 'retomar', codigo, token: 'token-0' });
  return { g, ana, id: nomes };
}

const logs = (v: GameView) => v.log.map((l) => l.text);
const cemiterio = (v: GameView, p: number) => v.players[p].graveyard.map((o) => o.def);

describe('fase 9 (1.4): bloqueio no servidor', () => {
  it('eu bloqueando o bot: ameaça com dois bloqueadores, montada pelos cliques da mesa; o bot divide o dano', () => {
    const { g, ana, id } = salaEmCombate({ active: 1, battlefield: [['Kami of Ancient Law', 'Goblin Electromancer'], ['Defiling Daemogoth']] }, [['Defiling Daemogoth', 0]], ['humano', 'bot']);
    const d = ana.vista.decision as DBloqueio;
    expect(d?.kind).toBe('blockers');
    const daemo = id('Defiling Daemogoth'), kami = id('Kami of Ancient Law'), goblin = id('Goblin Electromancer');
    expect(d.attackers).toEqual([daemo]);
    // como a mesa: clica no Kami e no Daemogoth; um bloqueador só é recusado pelo motor (ameaça)
    const clique = (e: EstadoBloqueio, c: ObjId) => cliqueBloqueio(d, e, { id: c, atacando: c === daemo, minhaCriatura: c !== daemo }) as EstadoBloqueio;
    let e: EstadoBloqueio = { bloqueios: {}, ativo: null };
    for (const c of [kami, daemo]) e = clique(e, c);
    g.tratar(ana, { t: 'responder', decisao: d.id, resposta: respostaBloqueio(e.bloqueios) });
    expect(ana.ultima('erro')?.msg).toMatch(/menace/);
    expect(ana.vista.decision?.id).toBe(d.id);
    for (const c of [goblin, daemo]) e = clique(e, c);
    g.tratar(ana, { t: 'responder', decisao: d.id, resposta: respostaBloqueio(e.bloqueios) });
    // o combate andou até a etapa final do bot, onde a pessoa para
    const v = ana.vista;
    expect(v.turn.step).toBe('end');
    expect(logs(v).some((l) => /Bloqueios: .*Kami of Ancient Law bloqueia Defiling Daemogoth/.test(l) && /Goblin Electromancer bloqueia Defiling Daemogoth/.test(l))).toBe(true);
    expect(cemiterio(v, 1)).toContain('Defiling Daemogoth');
    expect(cemiterio(v, 0).sort()).toEqual(['Goblin Electromancer', 'Kami of Ancient Law']);
    expect(v.players[0].life).toBe(40);
  });

  it('o bot bloqueando: mata o que dá e não perde os bloqueios bons por causa de um atacante com ameaça', () => {
    const { ana } = salaEmCombate({ active: 0, battlefield: [['Defiling Daemogoth', 'Kami of Ancient Law'], ['Canopy Gargantuan', 'Indomitable Ancients']] }, [['Defiling Daemogoth', 1], ['Kami of Ancient Law', 1]], ['humano', 'bot']);
    const v = ana.vista;
    expect(v.turn.step).toBe('main2');
    expect(v.decision?.kind).toBe('priority');
    expect(logs(v)).toContain('Bloqueios: Indomitable Ancients bloqueia Kami of Ancient Law.');
    expect(cemiterio(v, 0)).toEqual(['Kami of Ancient Law']);
    expect(v.players[1].life).toBe(35);
  });

  it('quatro jogadores: quem não é atacado nunca recebe a decisão; quem é atacado só vê o próprio atacante', () => {
    // Bruno (bot, no turno) ataca Carla (bot) e Ana (pessoa); Dani (bot) não é atacada
    const { g, ana, id } = salaEmCombate(
      { active: 1, battlefield: [['Kami of Ancient Law'], ['Goblin Electromancer', 'Elvish Mystic'], ['Indomitable Ancients'], ['Indomitable Ancients']] },
      [['Goblin Electromancer', 2], ['Elvish Mystic', 0]], ['humano', 'bot', 'bot', 'bot'],
    );
    const d = ana.vista.decision as DBloqueio;
    expect(d.kind).toBe('blockers');
    expect(d.attackers).toEqual([id('Elvish Mystic')]);
    expect(d.candidates).toEqual([{ obj: id('Kami of Ancient Law'), canBlock: [id('Elvish Mystic')] }]);
    // o Goblin ataca Carla: bloqueá-lo é recusado pelo servidor
    const kami = id('Kami of Ancient Law');
    expect(cliqueBloqueio(d, { bloqueios: {}, ativo: kami }, { id: id('Goblin Electromancer'), atacando: true, minhaCriatura: false })).toEqual({ recusa: 'Ela não pode bloquear essa criatura' });
    g.tratar(ana, { t: 'responder', decisao: d.id, resposta: { kind: 'blockers', blocks: [[kami, id('Goblin Electromancer')]] } });
    expect(ana.ultima('erro')?.msg).toMatch(/não pode bloquear/);
    g.tratar(ana, { t: 'responder', decisao: d.id, resposta: respostaBloqueio({ [kami]: id('Elvish Mystic') }) });
    const v = ana.vista;
    expect(v.turn.step).toBe('end');
    // Carla (bot) bloqueou o Goblin com a Indomitable Ancients; ninguém mais decidiu bloqueio
    expect(logs(v).some((l) => l.startsWith('Bloqueios:') && l.includes('Kami of Ancient Law bloqueia Elvish Mystic') && l.includes('Indomitable Ancients bloqueia Goblin Electromancer'))).toBe(true);
    expect(cemiterio(v, 1).sort()).toEqual(['Elvish Mystic', 'Goblin Electromancer']);
    expect(ana.vistas().filter((x) => x.decision?.kind === 'blockers').every((x) => x.decision!.id === d.id)).toBe(true);
  });

  it('quatro jogadores: atacam outro jogador e não você; a mesa nunca oferece bloqueio', () => {
    const { ana } = salaEmCombate(
      { active: 1, battlefield: [['Kami of Ancient Law'], ['Goblin Electromancer'], ['Indomitable Ancients'], []] },
      [['Goblin Electromancer', 2]], ['humano', 'bot', 'bot', 'bot'],
    );
    expect(ana.vistas().some((v) => v.decision?.kind === 'blockers')).toBe(false);
    const v = ana.vista;
    expect(v.turn.step).toBe('end');
    expect(logs(v)).toContain('Bloqueios: Indomitable Ancients bloqueia Goblin Electromancer.');
    expect(v.players[0].life).toBe(40);
  });
});

