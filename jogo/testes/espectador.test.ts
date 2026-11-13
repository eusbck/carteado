// Modo espectador (docs/superpowers/specs/2026-11-12-modo-espectador-design.md): quem tem o código e a senha assiste a
// mesa sem ocupar assento, a qualquer momento, só com a vista neutra e sem poder agir.
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import type { DeckList } from '../motor/state.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, MAX_ESPECTADORES, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';

const DECKS = decksJson as DeckList[];
const espera = () => new Promise((r) => setTimeout(r, 0));

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  msgs: MsgServidor[] = [];
  enviar(m: MsgServidor) { this.msgs.push(m); }
  ultima<T extends MsgServidor['t']>(t: T): Extract<MsgServidor, { t: T }> | undefined {
    return [...this.msgs].reverse().find((m) => m.t === t) as Extract<MsgServidor, { t: T }> | undefined;
  }
}

function sala1v1(banco = new Banco(':memory:')) {
  const g = new Gerente(banco, DECKS, SEM_ATRASO);
  const ana = new Falsa();
  g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
  const codigo = ana.ultima('sala')!.sala.codigo;
  return { g, banco, ana, codigo };
}

describe('modo espectador', () => {
  it('assiste no saguão sem ocupar assento, mesmo com a sala cheia', () => {
    const { g, ana, codigo } = sala1v1();
    const bruno = new Falsa();
    g.tratar(bruno, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Bruno' });
    const carla = new Falsa();
    g.tratar(carla, { t: 'assistir', codigo, senhaSala: 'segredo', nome: 'Carla' });
    expect(carla.ultima('erro')).toBeUndefined();
    const s = carla.ultima('sala')!;
    expect(s.voce).toBeNull();
    expect(s.sala.espectadores).toEqual(['Carla']);
    expect(s.sala.assentos.map((a) => a.tipo)).toEqual(['humano', 'humano']);
    expect(ana.ultima('sala')!.sala.espectadores).toEqual(['Carla']);
  });

  it('código ou senha errados recusam como no entrar', () => {
    const { g, codigo } = sala1v1();
    const carla = new Falsa();
    g.tratar(carla, { t: 'assistir', codigo, senhaSala: 'errada', nome: 'Carla' });
    expect(carla.ultima('erro')?.msg).toBe('Código ou senha da sala incorretos');
  });

  it('entra com a partida em andamento e vê só a vista neutra', async () => {
    const { g, ana, codigo } = sala1v1();
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id });
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    const carla = new Falsa();
    g.tratar(carla, { t: 'assistir', codigo, senhaSala: 'segredo', nome: 'Carla' });
    expect(carla.ultima('erro')).toBeUndefined();
    const v = carla.ultima('jogo')!.vista;
    expect(v.you).toBeNull();
    expect(v.hand).toEqual([]);
    expect(v.decision).toBeNull();
    expect(v.players.every((p) => p.handCount > 0)).toBe(true);
    const st = g.salas.get(codigo)!.game!.state;
    const maos = [0, 1].flatMap((p) => st.zones.hand[p]);
    expect(JSON.stringify(v)).not.toMatch(new RegExp(`"id":(${maos.join('|')}),"def":"[^"]`));
  });

  it('não age: toda mensagem de jogo é recusada e o chat não chega a ninguém', () => {
    const { g, ana, codigo } = sala1v1();
    const carla = new Falsa();
    g.tratar(carla, { t: 'assistir', codigo, senhaSala: 'segredo', nome: 'Carla' });
    for (const m of [{ t: 'chat', texto: 'oi' }, { t: 'iniciar' }, { t: 'deck', deck: DECKS[0].id }, { t: 'responder', decisao: 1, resposta: { kind: 'priority', action: 'pass' } }] as const) {
      carla.msgs = [];
      g.tratar(carla, m as never);
      expect(carla.ultima('erro')?.msg).toBe('Espectadores só assistem');
    }
    expect(ana.msgs.filter((m) => m.t === 'chat' && m.msgs.length > 0)).toEqual([]);
  });

  it('não recebe o chat dos jogadores', () => {
    const { g, ana, codigo } = sala1v1();
    const carla = new Falsa();
    g.tratar(carla, { t: 'assistir', codigo, senhaSala: 'segredo', nome: 'Carla' });
    g.tratar(ana, { t: 'chat', texto: 'segredo da mesa' });
    expect(carla.msgs.some((m) => m.t === 'chat')).toBe(false);
  });

  it('volta pelo retomar, inclusive depois de reiniciar o servidor', () => {
    const { g, banco, codigo } = sala1v1();
    const carla = new Falsa();
    g.tratar(carla, { t: 'assistir', codigo, senhaSala: 'segredo', nome: 'Carla' });
    const token = carla.ultima('sala')!.token;
    g.desconectar(carla);
    const volta = new Falsa();
    g.tratar(volta, { t: 'retomar', codigo, token });
    expect(volta.ultima('erro')).toBeUndefined();
    expect(volta.ultima('sala')!.voce).toBeNull();
    g.salvarTudo();
    const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
    g2.restaurar();
    const outra = new Falsa();
    g2.tratar(outra, { t: 'retomar', codigo, token });
    expect(outra.ultima('erro')).toBeUndefined();
    expect(outra.ultima('sala')!.sala.espectadores).toEqual(['Carla']);
  });

  it(`aceita até ${MAX_ESPECTADORES} espectadores`, () => {
    const { g, codigo } = sala1v1();
    for (let i = 0; i < MAX_ESPECTADORES; i++) {
      const c = new Falsa();
      g.tratar(c, { t: 'assistir', codigo, senhaSala: 'segredo', nome: `E${i}` });
      expect(c.ultima('erro')).toBeUndefined();
    }
    const mais = new Falsa();
    g.tratar(mais, { t: 'assistir', codigo, senhaSala: 'segredo', nome: 'Mais' });
    expect(mais.ultima('erro')?.msg).toBe(`A sala já tem ${MAX_ESPECTADORES} espectadores`);
  });

  it('quem está sentado não assiste a mesma sala pela mesma conexão', () => {
    const { g, ana, codigo } = sala1v1();
    g.tratar(ana, { t: 'assistir', codigo, senhaSala: 'segredo', nome: 'Ana' });
    expect(ana.ultima('erro')?.msg).toBe('Você já está nesta sala');
  });

  it('sair tira o espectador da lista', () => {
    const { g, ana, codigo } = sala1v1();
    const carla = new Falsa();
    g.tratar(carla, { t: 'assistir', codigo, senhaSala: 'segredo', nome: 'Carla' });
    g.tratar(carla, { t: 'sair' });
    expect(carla.ultima('saiu')).toBeDefined();
    expect(ana.ultima('sala')!.sala.espectadores).toEqual([]);
  });

  it('continua assistindo quando a partida começa e os lugares livres saem', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', lugares: 4 });
    const codigo = ana.ultima('sala')!.sala.codigo;
    const carla = new Falsa();
    g.tratar(carla, { t: 'assistir', codigo, senhaSala: 'segredo', nome: 'Carla' });
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id });
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    expect(ana.ultima('erro')).toBeUndefined();
    expect(carla.ultima('saiu')).toBeUndefined();
    expect(carla.ultima('jogo')!.vista.players).toHaveLength(2);
    expect(ana.ultima('sala')!.sala.espectadores).toEqual(['Carla']);
  });
});
