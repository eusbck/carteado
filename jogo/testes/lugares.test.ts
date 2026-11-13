// Salas de 2 a 6 lugares, no servidor, sem rede (conexões falsas e banco em memória):
//  - 'criar' com `lugares` (2 a 6; fora disso a forma recusa) e o pedido antigo com `modo` ('1v1': 2, '4p': 4; sem
//    nada: 4);
//  - seguir do saguão (ou começar) com lugares livres: a sala fica só com quem está sentado; cada conexão segue o
//    seu assento (voce, token, anfitrião, autor do chat), e quem volta pelo token cai no lugar novo, também depois
//    de reiniciar o servidor; com menos de dois sentados, erro;
//  - partida a três sem bot (multiplayer) e duelo numa sala de seis (sem multiplayer);
//  - a mensagem 'lugares': só o anfitrião, aumenta com lugares livres no fim (e volta o saguão para os lugares),
//    diminui tirando só lugares livres (do fim para o começo), recusa diminuir abaixo de quem está sentado, não
//    mexe na partida em andamento e tira a sala encerrada da partida antiga;
//  - partida de seis (uma pessoa e cinco bots) anda sem erro.
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import type { DeckList } from '../motor/state.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgCliente, MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';

const DECKS = decksJson as DeckList[];

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  token: string | null = null;
  msgs: MsgServidor[] = [];
  enviar(m: MsgServidor) { this.msgs.push(m); }
  ultima<T extends MsgServidor['t']>(t: T): Extract<MsgServidor, { t: T }> | undefined {
    return this.msgs.findLast((m) => m.t === t) as Extract<MsgServidor, { t: T }> | undefined;
  }
  erros(): string[] {
    return this.msgs.flatMap((m) => (m.t === 'erro' ? [m.msg] : []));
  }
}

// a sala sai no fim da condução (avancar): espera a vez dela antes de ler
const espera = () => new Promise((r) => setTimeout(r, 0));

const gerente = (banco = new Banco(':memory:')) => new Gerente(banco, DECKS, SEM_ATRASO);

/** cria a sala com o pedido dado (Ana anfitriã) e devolve o código, ou null se foi recusada */
function criar(g: Gerente, pedido: Record<string, unknown>) {
  const ana = new Falsa();
  g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', ...pedido } as unknown as MsgCliente);
  const codigo = ana.ultima('sala')?.sala.codigo ?? null;
  return { ana, codigo };
}

/** sala de `lugares` lugares com as pessoas dadas, na ordem (a primeira cria e conduz) */
function salaCom(g: Gerente, lugares: number, nomes: string[]) {
  const ps = nomes.map(() => new Falsa());
  g.tratar(ps[0], { t: 'criar', nome: nomes[0], senhaSala: 'segredo', lugares });
  const codigo = ps[0].ultima('sala')!.sala.codigo;
  for (let k = 1; k < nomes.length; k++) g.tratar(ps[k], { t: 'entrar', codigo, senhaSala: 'segredo', nome: nomes[k] });
  return { ps, codigo, s: g.salas.get(codigo)! };
}

/** os assentos como a pessoa os vê (última sala recebida): [tipo, nome] */
const vistos = (p: Falsa) => p.ultima('sala')!.sala.assentos.map((a) => [a.tipo, a.nome]);

/** responde as decisões da pessoa com a resposta padrão (fica com a mão, passa, não ataca…) */
async function jogar(g: Gerente, p: Falsa, n: number) {
  for (let k = 0; k < n; k++) {
    await espera();
    const d = p.ultima('jogo')?.vista.decision;
    if (!d || d.player !== p.ultima('sala')!.voce) return;
    const resp: MsgCliente = d.kind === 'mulligan' ? { t: 'responder', decisao: d.id, resposta: { kind: 'mulligan', keep: true } }
      : d.kind === 'priority' ? { t: 'responder', decisao: d.id, resposta: { kind: 'priority', action: 'pass' } }
      : d.kind === 'select' ? { t: 'responder', decisao: d.id, resposta: { kind: 'select', ids: d.items.filter((x) => !x.disabled).slice(0, d.min).map((x) => x.id) } }
      : d.kind === 'payment' ? { t: 'responder', decisao: d.id, resposta: { kind: 'payment', auto: true } }
      : d.kind === 'attackers' ? { t: 'responder', decisao: d.id, resposta: { kind: 'attackers', attacks: [] } }
      : d.kind === 'blockers' ? { t: 'responder', decisao: d.id, resposta: { kind: 'blockers', blocks: [] } }
      : d.kind === 'number' ? { t: 'responder', decisao: d.id, resposta: { kind: 'number', value: d.min } }
      : { t: 'conceder' };
    g.tratar(p, resp);
  }
}

describe('lugares: criar a sala', () => {
  it.each([2, 3, 5, 6])('lugares: %i dá uma sala com esse número de assentos, todos livres menos o de quem criou', async (n) => {
    const banco = new Banco(':memory:');
    const g = gerente(banco);
    const { ana, codigo } = criar(g, { lugares: n });
    await espera();
    expect(ana.erros()).toEqual([]);
    const sala = ana.ultima('sala')!.sala;
    expect(sala.assentos).toHaveLength(n);
    expect(sala.assentos.map((a) => a.tipo)).toEqual(['humano', ...Array(n - 1).fill('vazio')]);
    expect(sala.assentos.map((a) => a.indice)).toEqual([...Array(n).keys()]);
    // o tamanho é o dos assentos: a sala pública e a gravada não têm mais o modo
    expect(sala).not.toHaveProperty('modo');
    const gravada = banco.salas().find((x) => x.codigo === codigo)!.dados as { modo?: unknown; assentos: unknown[] };
    expect(gravada.modo).toBeUndefined();
    expect(gravada.assentos).toHaveLength(n);
  });

  it.each([1, 7, 0, -2, 2.5, '4', null, Number.NaN])('lugares: %s é recusado e nenhuma sala é criada', (n) => {
    const g = gerente();
    const { ana, codigo } = criar(g, { lugares: n });
    expect(codigo).toBeNull();
    expect(ana.erros()).toEqual(['Mensagem inválida']);
    expect(ana.ultima('erro')).toMatchObject({ de: 'criar' });
    expect(g.salas.size).toBe(0);
    expect(ana.sala).toBeNull();
  });

  it("o pedido antigo continua valendo: modo '1v1' dá 2 lugares, '4p' dá 4, e sem lugares nem modo, 4", () => {
    const g = gerente();
    const tamanho = (pedido: Record<string, unknown>) => {
      const { ana, codigo } = criar(g, pedido);
      expect(ana.erros()).toEqual([]);
      return g.salas.get(codigo!)!.d.assentos.length;
    };
    expect(tamanho({ modo: '1v1' })).toBe(2);
    expect(tamanho({ modo: '4p' })).toBe(4);
    expect(tamanho({})).toBe(4);
    // os dois juntos: vale o número de lugares
    expect(tamanho({ modo: '1v1', lugares: 5 })).toBe(5);
    expect(tamanho({ modo: '4p', lugares: 2 })).toBe(2);
  });

  it('modo desconhecido continua recusado', () => {
    const g = gerente();
    const { ana, codigo } = criar(g, { modo: '3p' });
    expect(codigo).toBeNull();
    expect(ana.erros()).toEqual(['Modo inválido']);
    expect(g.salas.size).toBe(0);
  });

  it('numa sala de 6 entram seis pessoas e a sétima encontra a sala cheia; bots vão nos assentos 4 e 5', async () => {
    const g = gerente();
    const { ps, codigo, s } = salaCom(g, 6, ['Ana', 'Bruno', 'Carla', 'Davi', 'Eva', 'Fábio']);
    await espera();
    expect(ps.map((p) => p.ultima('sala')!.voce)).toEqual([0, 1, 2, 3, 4, 5]);
    const setima = new Falsa();
    g.tratar(setima, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Gil' });
    expect(setima.ultima('erro')?.msg).toMatch(/cheia/);
    // dois saem e a anfitriã põe bots nos lugares do fim
    g.tratar(ps[4], { t: 'sair' });
    g.tratar(ps[5], { t: 'sair' });
    g.tratar(ps[0], { t: 'bot', assento: 4, deck: DECKS[4].id });
    g.tratar(ps[0], { t: 'bot', assento: 5, deck: DECKS[5].id });
    await espera();
    expect(ps[0].erros()).toEqual([]);
    expect(s.d.assentos.map((a) => a.tipo)).toEqual(['humano', 'humano', 'humano', 'humano', 'bot', 'bot']);
  });
});

describe('lugares: seguir com lugares livres', () => {
  it('três pessoas numa sala de 4 com um buraco no meio: ao seguir, a sala fica com 3, e cada um segue o seu assento', async () => {
    const banco = new Banco(':memory:');
    const g = gerente(banco);
    const { ps: [ana, bruno, carla, davi], codigo, s } = salaCom(g, 4, ['Ana', 'Bruno', 'Carla', 'Davi']);
    // a segunda aba de Davi, pelo token
    const tokens = new Map([ana, bruno, carla, davi].map((p) => [p, p.ultima('sala')!.token]));
    const abaDavi = new Falsa();
    g.tratar(abaDavi, { t: 'retomar', codigo, token: tokens.get(davi)! });
    expect(abaDavi.ultima('sala')!.voce).toBe(3);
    // o chat guarda o assento de cada autor
    g.tratar(ana, { t: 'chat', texto: 'oi, eu vou sair' });
    g.tratar(carla, { t: 'chat', texto: 'tchau, Ana' });
    g.tratar(davi, { t: 'chat', texto: 'bora' });
    // Ana sai: o assento 0 vaga e Bruno (assento 1) passa a conduzir
    g.tratar(ana, { t: 'sair' });
    await espera();
    expect(bruno.ultima('sala')!.sala.anfitriao).toBe(1);
    expect(vistos(bruno)).toEqual([['vazio', null], ['humano', 'Bruno'], ['humano', 'Carla'], ['humano', 'Davi']]);
    // Bruno escolhe deck antes de seguir: o deck vai junto com o assento
    g.tratar(bruno, { t: 'deck', deck: DECKS[1].id });

    // um convidado não segue o saguão
    g.tratar(carla, { t: 'etapa', etapa: 'regras' });
    expect(carla.ultima('erro')?.msg).toMatch(/Só quem criou a sala avança/);
    expect(s.d.assentos).toHaveLength(4);

    g.tratar(bruno, { t: 'etapa', etapa: 'regras' });
    await espera();
    expect(bruno.erros()).toEqual([]);
    expect(s.d.assentos).toHaveLength(3);
    const esperado = [['humano', 'Bruno'], ['humano', 'Carla'], ['humano', 'Davi']];
    for (const [p, voce] of [[bruno, 0], [carla, 1], [davi, 2], [abaDavi, 2]] as const) {
      const m = p.ultima('sala')!;
      expect(m.voce).toBe(voce);
      expect(p.assento).toBe(voce);
      // o token é o mesmo de antes: ele foi junto com o assento
      expect(m.token).toBe(tokens.get(p === abaDavi ? davi : p));
      expect(m.sala.anfitriao).toBe(0);
      expect(m.sala.etapa).toBe('regras');
      expect(vistos(p)).toEqual(esperado);
      expect(p.ultima('saiu')).toBeUndefined();
    }
    expect(s.d.assentos[0].deck).toBe(DECKS[1].id);
    // o autor de cada mensagem do chat segue o assento; o de quem saiu fica sem lugar
    expect(s.d.chat!.map((m) => [m.nome, m.de])).toEqual([['Ana', -1], ['Carla', 1], ['Davi', 2]]);

    // quem mudou de lugar volta pelo token (outra aba) e cai no lugar novo
    const volta = new Falsa();
    g.tratar(volta, { t: 'retomar', codigo, token: tokens.get(davi)! });
    expect(volta.erros()).toEqual([]);
    expect(volta.ultima('sala')!.voce).toBe(2);
    expect(volta.ultima('sala')!.sala.assentos[2].nome).toBe('Davi');
    // e o token de Ana, que saiu, não vale
    const velha = new Falsa();
    g.tratar(velha, { t: 'retomar', codigo, token: tokens.get(ana)! });
    expect(velha.ultima('erro')?.msg).toMatch(/Não foi possível voltar/);

    // a sala menor fica gravada: depois de reiniciar o servidor, Carla volta pelo token no assento 1
    const gravada = banco.salas().find((x) => x.codigo === codigo)!.dados as { assentos: unknown[]; anfitriao: number };
    expect(gravada.assentos).toHaveLength(3);
    expect(gravada.anfitriao).toBe(0);
    const g2 = gerente(banco);
    g2.restaurar();
    const carla2 = new Falsa();
    g2.tratar(carla2, { t: 'retomar', codigo, token: tokens.get(carla)! });
    expect(carla2.ultima('sala')!.voce).toBe(1);
    expect(carla2.ultima('sala')!.sala.assentos).toHaveLength(3);

    // Bruno conduz no assento novo: decks e a partida a três, sem bot
    g.tratar(bruno, { t: 'etapa', etapa: 'decks' });
    g.tratar(carla, { t: 'deck', deck: DECKS[2].id });
    g.tratar(davi, { t: 'deck', deck: DECKS[3].id });
    g.tratar(bruno, { t: 'iniciar' });
    await espera();
    expect([bruno, carla, davi].flatMap((p) => p.erros())).toEqual(['Só quem criou a sala avança o saguão']);
    expect(s.d.estado).toBe('jogando');
    const st = s.game!.state;
    expect(st.players).toHaveLength(3);
    expect(st.config.multiplayer).toBe(true);
    expect(st.config.players.map((p) => [p.name, p.deckId])).toEqual([['Bruno', DECKS[1].id], ['Carla', DECKS[2].id], ['Davi', DECKS[3].id]]);
    for (const [p, voce] of [[bruno, 0], [carla, 1], [davi, 2]] as const) {
      const v = p.ultima('jogo')!.vista;
      expect(v.you).toBe(voce);
      expect(v.players).toHaveLength(3);
      expect(v.hand.every((c) => c.owner === voce)).toBe(true);
    }
  }, 60000);

  it('o lugar livre no fim também sai ao seguir (ninguém muda de assento) e a etapa decks também tira os livres', async () => {
    const g = gerente();
    const { ps: [ana, bruno, carla], s } = salaCom(g, 5, ['Ana', 'Bruno', 'Carla']);
    g.tratar(ana, { t: 'etapa', etapa: 'decks' });
    await espera();
    expect(ana.erros()).toEqual([]);
    expect(s.d.assentos).toHaveLength(3);
    expect(s.d.etapa).toBe('decks');
    expect([ana, bruno, carla].map((p) => p.ultima('sala')!.voce)).toEqual([0, 1, 2]);
    // voltar aos lugares não muda o número de lugares
    g.tratar(ana, { t: 'etapa', etapa: 'lugares' });
    await espera();
    expect(s.d.assentos).toHaveLength(3);
    expect(s.d.etapa).toBe('lugares');
  });

  it('pessoas e bots com buracos: a sala fica só com os ocupados, na ordem, e os bots mantêm deck, nível e nome', async () => {
    const g = gerente();
    const { ps: [ana], s } = salaCom(g, 6, ['Ana']);
    g.tratar(ana, { t: 'bot', assento: 2, deck: DECKS[2].id, nivel: 'iniciante' });
    g.tratar(ana, { t: 'bot', assento: 4, deck: DECKS[4].id });
    const bruno = new Falsa();
    g.tratar(bruno, { t: 'entrar', codigo: s.codigo, senhaSala: 'segredo', nome: 'Bruno' });
    expect(bruno.ultima('sala')!.voce).toBe(1);
    const nomes = [s.d.assentos[2].nome, s.d.assentos[4].nome];
    g.tratar(ana, { t: 'etapa', etapa: 'regras' });
    await espera();
    expect(ana.erros()).toEqual([]);
    expect(s.d.assentos.map((a) => [a.tipo, a.nome, a.deck, a.nivel ?? null])).toEqual([
      ['humano', 'Ana', null, null], ['humano', 'Bruno', null, null], ['bot', nomes[0], DECKS[2].id, 'iniciante'], ['bot', nomes[1], DECKS[4].id, 'intermediario'],
    ]);
    expect(bruno.ultima('sala')!.voce).toBe(1);
    expect(ana.ultima('sala')!.sala.assentos.map((a) => a.indice)).toEqual([0, 1, 2, 3]);
  });

  it('duas pessoas numa sala de 6 começam direto (sem passar pelas etapas) um duelo, sem multiplayer', async () => {
    const g = gerente();
    const { ps: [ana, bruno], s } = salaCom(g, 6, ['Ana', 'Bruno']);
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(bruno, { t: 'deck', deck: DECKS[1].id });
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    expect([...ana.erros(), ...bruno.erros()]).toEqual([]);
    expect(s.d.estado).toBe('jogando');
    expect(s.d.assentos).toHaveLength(2);
    expect(s.game!.state.players).toHaveLength(2);
    expect(s.game!.state.config.multiplayer).toBe(false);
    expect(ana.ultima('sala')!.sala.assentos).toHaveLength(2);
    expect(bruno.ultima('jogo')!.vista.you).toBe(1);
  }, 60000);

  it('com uma pessoa só não segue nem começa: erro, e a sala fica como estava', async () => {
    const g = gerente();
    const { ps: [ana], s } = salaCom(g, 4, ['Ana']);
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    for (const m of [{ t: 'etapa', etapa: 'regras' }, { t: 'etapa', etapa: 'decks' }, { t: 'iniciar' }] as MsgCliente[]) g.tratar(ana, m);
    expect(ana.erros()).toHaveLength(3);
    expect(ana.erros().every((e) => /pelo menos 2 jogadores/.test(e))).toBe(true);
    await espera();
    expect(s.d.assentos).toHaveLength(4);
    expect(s.publica().etapa).toBe('lugares');
    expect(s.d.estado).toBe('espera');
    expect(s.d.partida).toBeNull();
    expect(ana.ultima('sala')!.voce).toBe(0);
    // num duelo também
    const g2 = gerente();
    const { ps: [davi], s: s2 } = salaCom(g2, 2, ['Davi']);
    g2.tratar(davi, { t: 'deck', deck: DECKS[0].id });
    g2.tratar(davi, { t: 'iniciar' });
    expect(davi.ultima('erro')?.msg).toMatch(/pelo menos 2 jogadores/);
    expect(s2.d.assentos).toHaveLength(2);
    // um bot já basta
    g.tratar(ana, { t: 'bot', assento: 3, deck: DECKS[3].id });
    g.tratar(ana, { t: 'etapa', etapa: 'regras' });
    await espera();
    expect(ana.erros()).toHaveLength(3);
    expect(s.d.assentos.map((a) => a.tipo)).toEqual(['humano', 'bot']);
  });

  it('início recusado por falta de deck não mexe nos lugares: a sala e os assentos de todos ficam como estavam', async () => {
    const banco = new Banco(':memory:');
    const g = gerente(banco);
    const { ps: [ana, bruno, carla], codigo, s } = salaCom(g, 4, ['Ana', 'Bruno', 'Carla']);
    g.tratar(bruno, { t: 'sair' });
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    await espera();
    expect(carla.ultima('sala')!.voce).toBe(2);
    // Carla ainda não escolheu deck
    g.tratar(ana, { t: 'iniciar' });
    expect(ana.ultima('erro')?.msg).toMatch(/escolher um deck/);
    await espera();
    expect(s.d.estado).toBe('espera');
    expect(s.d.assentos.map((a) => a.tipo)).toEqual(['humano', 'vazio', 'humano', 'vazio']);
    expect(carla.assento).toBe(2);
    expect(carla.ultima('sala')!.voce).toBe(2);
    expect((banco.salas().find((x) => x.codigo === codigo)!.dados as { assentos: unknown[] }).assentos).toHaveLength(4);
    // deck que saiu do saguão depois de escolhido: também recusa sem mexer nos lugares
    g.tratar(carla, { t: 'deck', deck: DECKS[2].id });
    g.trocarDecks(DECKS.filter((_, k) => k !== 2));
    g.tratar(ana, { t: 'iniciar' });
    expect(ana.ultima('erro')?.msg).toMatch(/não está mais disponível/);
    await espera();
    expect(s.d.assentos).toHaveLength(4);
    expect(carla.ultima('sala')!.voce).toBe(2);
    // com o deck de volta, começa a dois (Carla vai para o assento 1)
    g.trocarDecks(DECKS);
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    expect(s.d.estado).toBe('jogando');
    expect(carla.ultima('sala')!.voce).toBe(1);
    expect(carla.ultima('jogo')!.vista.you).toBe(1);
    expect(s.game!.state.config.multiplayer).toBe(false);
  }, 60000);

  it('sala encerrada com lugar vago: seguir o saguão tira a partida antiga e fica só com quem sobrou', async () => {
    const g = gerente();
    const { ps: [ana, bruno], s } = salaCom(g, 3, ['Ana', 'Bruno']);
    g.tratar(ana, { t: 'bot', assento: 2, deck: DECKS[2].id });
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(bruno, { t: 'deck', deck: DECKS[1].id });
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    expect(s.game!.state.config.multiplayer).toBe(true);
    // Bruno sai no meio (concede; o assento fica dele até o fim) e Ana concede: a partida acaba e o lugar dele vaga
    g.tratar(bruno, { t: 'sair' });
    await espera();
    g.tratar(ana, { t: 'conceder' });
    await espera();
    expect(s.d.estado).toBe('fim');
    expect(s.d.assentos.map((a) => a.tipo)).toEqual(['humano', 'vazio', 'bot']);
    g.tratar(ana, { t: 'etapa', etapa: 'regras' });
    await espera();
    expect(ana.erros()).toEqual([]);
    expect(s.d.estado).toBe('espera');
    expect(s.d.partida).toBeNull();
    expect(s.game).toBeNull();
    expect(s.d.etapa).toBe('regras');
    expect(ana.ultima('sala')!.sala).toMatchObject({ estado: 'espera', partida: null, etapa: 'regras' });
    expect(vistos(ana).map(([t]) => t)).toEqual(['humano', 'bot']);
  }, 60000);
});

describe("lugares: a mensagem 'lugares'", () => {
  it('só o anfitrião muda; valores fora de 2 a 6 são recusados pela forma', async () => {
    const g = gerente();
    const { ps: [ana, bruno], s } = salaCom(g, 4, ['Ana', 'Bruno']);
    g.tratar(bruno, { t: 'lugares', n: 3 });
    expect(bruno.ultima('erro')?.msg).toMatch(/Só quem criou a sala muda o número de lugares/);
    expect(bruno.ultima('erro')).toMatchObject({ de: 'lugares' });
    for (const n of [1, 7, 0, 2.5, '3', null, undefined]) g.tratar(ana, { t: 'lugares', n } as unknown as MsgCliente);
    expect(ana.erros()).toEqual(Array(7).fill('Mensagem inválida'));
    // o mesmo número: nada muda e não é erro
    g.tratar(ana, { t: 'lugares', n: 4 });
    expect(ana.erros()).toHaveLength(7);
    await espera();
    expect(s.d.assentos).toHaveLength(4);
  });

  it('aumentar de 2 para 5 põe lugares livres no fim, volta o saguão para os lugares, grava, e quem chega senta', async () => {
    const banco = new Banco(':memory:');
    const g = gerente(banco);
    const { ps: [ana, bruno], codigo, s } = salaCom(g, 2, ['Ana', 'Bruno']);
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(ana, { t: 'etapa', etapa: 'decks' });
    await espera();
    expect(s.d.etapa).toBe('decks');
    g.tratar(ana, { t: 'lugares', n: 5 });
    await espera();
    expect(ana.erros()).toEqual([]);
    expect(s.d.etapa).toBe('lugares');
    expect(vistos(bruno)).toEqual([['humano', 'Ana'], ['humano', 'Bruno'], ['vazio', null], ['vazio', null], ['vazio', null]]);
    expect(bruno.ultima('sala')!.sala.etapa).toBe('lugares');
    expect(bruno.ultima('sala')!.voce).toBe(1);
    // os decks já escolhidos ficam
    expect(s.d.assentos[0].deck).toBe(DECKS[0].id);
    expect((banco.salas().find((x) => x.codigo === codigo)!.dados as { assentos: unknown[] }).assentos).toHaveLength(5);
    const carla = new Falsa();
    g.tratar(carla, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Carla' });
    expect(carla.ultima('sala')!.voce).toBe(2);
    // bot no lugar novo, e até 6
    g.tratar(ana, { t: 'bot', assento: 4, deck: DECKS[4].id });
    g.tratar(ana, { t: 'lugares', n: 6 });
    await espera();
    expect(ana.erros()).toEqual([]);
    expect(s.d.assentos.map((a) => a.tipo)).toEqual(['humano', 'humano', 'humano', 'vazio', 'bot', 'vazio']);
  });

  it('diminuir abaixo de quem está sentado é recusado e nada muda', async () => {
    const g = gerente();
    const { ps: [ana, bruno], s } = salaCom(g, 5, ['Ana', 'Bruno']);
    g.tratar(ana, { t: 'bot', assento: 3, deck: DECKS[3].id });
    g.tratar(ana, { t: 'lugares', n: 2 });
    expect(ana.ultima('erro')?.msg).toMatch(/Há 3 jogadores na sala/);
    await espera();
    expect(s.d.assentos.map((a) => a.tipo)).toEqual(['humano', 'humano', 'vazio', 'bot', 'vazio']);
    expect(bruno.ultima('sala')!.sala.assentos).toHaveLength(5);
    // até 3 vale
    g.tratar(ana, { t: 'lugares', n: 3 });
    await espera();
    expect(ana.erros()).toHaveLength(1);
    expect(s.d.assentos.map((a) => a.tipo)).toEqual(['humano', 'humano', 'bot']);
  });

  it('diminuir tira só lugares livres, do fim para o começo: [pessoa, livre, bot, livre, pessoa] vira [pessoa, bot, pessoa]', async () => {
    const banco = new Banco(':memory:');
    const g = gerente(banco);
    const { ps: [ana], codigo, s } = salaCom(g, 5, ['Ana']);
    for (const k of [1, 2, 3]) g.tratar(ana, { t: 'bot', assento: k, deck: DECKS[k].id });
    const bruno = new Falsa();
    g.tratar(bruno, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Bruno' });
    expect(bruno.ultima('sala')!.voce).toBe(4);
    const tokenBruno = bruno.ultima('sala')!.token;
    g.tratar(bruno, { t: 'deck', deck: DECKS[5].id });
    g.tratar(ana, { t: 'bot', assento: 1, deck: null });
    g.tratar(ana, { t: 'bot', assento: 3, deck: null });
    const bot = { ...s.d.assentos[2] };
    expect(s.d.assentos.map((a) => a.tipo)).toEqual(['humano', 'vazio', 'bot', 'vazio', 'humano']);
    // um a menos: sai o livre mais ao fim (o assento 3)
    g.tratar(ana, { t: 'lugares', n: 4 });
    await espera();
    expect(ana.erros()).toEqual([]);
    expect(s.d.assentos.map((a) => a.tipo)).toEqual(['humano', 'vazio', 'bot', 'humano']);
    expect(bruno.ultima('sala')!.voce).toBe(3);
    // mais um: sai o outro livre
    g.tratar(ana, { t: 'lugares', n: 3 });
    await espera();
    expect(ana.erros()).toEqual([]);
    expect(s.d.assentos.map((a) => [a.tipo, a.nome])).toEqual([['humano', 'Ana'], ['bot', bot.nome], ['humano', 'Bruno']]);
    expect(s.d.assentos[1]).toMatchObject({ deck: bot.deck, nivel: bot.nivel });
    expect(s.d.anfitriao).toBe(0);
    const m = bruno.ultima('sala')!;
    expect(m.voce).toBe(2);
    expect(m.token).toBe(tokenBruno);
    expect(m.sala.assentos[2]).toMatchObject({ nome: 'Bruno', deck: DECKS[5].id });
    expect(bruno.assento).toBe(2);
    // sem lugar livre, não diminui mais
    g.tratar(ana, { t: 'lugares', n: 2 });
    expect(ana.ultima('erro')?.msg).toMatch(/Há 3 jogadores na sala/);
    // Bruno volta pelo token no lugar novo
    const volta = new Falsa();
    g.tratar(volta, { t: 'retomar', codigo, token: tokenBruno });
    expect(volta.ultima('sala')!.voce).toBe(2);
  });

  it('quando o anfitrião muda de assento ao diminuir, continua conduzindo', async () => {
    const g = gerente();
    const { ps: [ana, bruno, carla], s } = salaCom(g, 4, ['Ana', 'Bruno', 'Carla']);
    // Ana sai: Bruno (assento 1) conduz; o assento 0 fica livre
    g.tratar(ana, { t: 'sair' });
    g.tratar(bruno, { t: 'lugares', n: 2 });
    await espera();
    expect(bruno.erros()).toEqual([]);
    expect(s.d.assentos.map((a) => a.nome)).toEqual(['Bruno', 'Carla']);
    expect(s.d.anfitriao).toBe(0);
    expect(bruno.ultima('sala')!).toMatchObject({ voce: 0, sala: { anfitriao: 0 } });
    expect(carla.ultima('sala')!.voce).toBe(1);
    // e conduz no assento novo; Carla, não
    g.tratar(carla, { t: 'lugares', n: 3 });
    expect(carla.ultima('erro')?.msg).toMatch(/Só quem criou/);
    g.tratar(bruno, { t: 'lugares', n: 3 });
    await espera();
    expect(bruno.erros()).toEqual([]);
    expect(s.d.assentos).toHaveLength(3);
  });

  it('com a partida em andamento não muda; na encerrada, a sala volta para o saguão com o novo número de lugares', async () => {
    const g = gerente();
    const { ps: [ana], s } = salaCom(g, 2, ['Ana']);
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id });
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    expect(s.d.estado).toBe('jogando');
    g.tratar(ana, { t: 'lugares', n: 4 });
    expect(ana.ultima('erro')?.msg).toMatch(/A partida já começou/);
    expect(s.d.assentos).toHaveLength(2);
    g.tratar(ana, { t: 'conceder' });
    await espera();
    expect(s.d.estado).toBe('fim');
    g.tratar(ana, { t: 'lugares', n: 4 });
    await espera();
    expect(ana.erros()).toEqual(['A partida já começou']);
    expect(s.d.estado).toBe('espera');
    expect(s.d.partida).toBeNull();
    expect(s.game).toBeNull();
    expect(ana.ultima('sala')!.sala).toMatchObject({ estado: 'espera', partida: null, etapa: 'lugares' });
    expect(vistos(ana).map(([t]) => t)).toEqual(['humano', 'bot', 'vazio', 'vazio']);
  }, 60000);
});

describe('lugares: partida de seis', () => {
  it('uma pessoa e cinco bots: a partida começa com seis, multiplayer, e os bots jogam sem erro', async () => {
    const g = gerente();
    g.sementeFixa = 'lugares-seis';
    const { ps: [ana], s } = salaCom(g, 6, ['Ana']);
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    // bots Iniciante (decidem por regras, sem simular): cinco bots que simulam levam minutos para dar a volta na mesa
    for (let k = 1; k < 6; k++) g.tratar(ana, { t: 'bot', assento: k, deck: DECKS[k].id, nivel: 'iniciante' });
    g.tratar(ana, { t: 'etapa', etapa: 'regras' });
    g.tratar(ana, { t: 'etapa', etapa: 'decks' });
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    expect(ana.erros()).toEqual([]);
    expect(s.d.estado).toBe('jogando');
    const st = () => s.game!.state;
    expect(st().players).toHaveLength(6);
    expect(st().config.multiplayer).toBe(true);
    expect(ana.ultima('jogo')!.vista.players).toHaveLength(6);
    await jogar(g, ana, 12);
    expect(ana.erros()).toEqual([]);
    expect(s.erro).toBeNull();
    // cada bot respondeu ao menos uma decisão (o mulligan) e a mesa passou do começo
    const deBots = new Set(s.game!.inputs.flatMap((x) => (x.t === 'a' && x.p !== 0 ? [x.p] : [])));
    expect([...deBots].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(st().turn.number).toBeGreaterThan(1);
  }, 120000);
});
