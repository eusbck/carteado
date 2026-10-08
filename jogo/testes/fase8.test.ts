// Fase 8 no servidor: regra de auxílios da sala e o desfazer com aceite da mesa (conexões falsas,
// banco em memória, sem atrasos).
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import { defaultAnswer } from '../motor/ask.ts';
import { DEFAULT_STOPS } from '../motor/autopass.ts';
import type { DeckList } from '../motor/state.ts';
import type { Decision } from '../motor/types.ts';
import type { GameView } from '../motor/view.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgCliente, MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, SEM_ATRASO, type Atrasos, type Conexao } from '../servidor/salas.ts';

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
}

const espera = (ms = 0) => new Promise((r) => setTimeout(r, ms));

/** sala de duas pessoas (Ana cria, Bruno entra) ou de Ana com um bot */
function sala(g: Gerente, opts: { bruno?: boolean; auxilios?: 'permitidos' | 'proibidos' } = {}) {
  const ana = new Falsa();
  g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
  const codigo = ana.ultima('sala')!.sala.codigo;
  const bruno = new Falsa();
  if (opts.bruno !== false) g.tratar(bruno, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Bruno' });
  else g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id });
  if (opts.auxilios) g.tratar(ana, { t: 'auxilios', regra: opts.auxilios });
  g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
  if (opts.bruno !== false) g.tratar(bruno, { t: 'deck', deck: DECKS[1].id });
  return { ana, bruno, codigo };
}

/** as pessoas param nas paradas padrão mesmo sem jogada possível: quem jogou o terreno continua com a
 *  prioridade (senão o passe automático pode levar a partida ao próximo turno, conforme a mão sorteada) */
function pararSempre(g: Gerente, ps: Falsa[]) {
  for (const p of ps) g.tratar(p, { t: 'paradas', paradas: { ...DEFAULT_STOPS, skipWhenNothing: false } });
}

/** a resposta neutra do motor, pagando automaticamente quando há pagamento */
function respostaPadrao(d: Decision): MsgCliente {
  return { t: 'responder', decisao: d.id, resposta: d.kind === 'payment' ? { kind: 'payment', auto: true } : defaultAnswer(d) };
}

/** responde o padrão por todas as pessoas até `parar` dizer que chegou */
async function conduzir(g: Gerente, ps: Falsa[], parar: (p: Falsa, d: Decision, v: GameView) => boolean, limite = 400): Promise<{ p: Falsa; d: Decision }> {
  const respondidas = new Set<string>();
  for (let k = 0; k < limite; k++) {
    await espera();
    let andou = false;
    for (const [i, p] of ps.entries()) {
      const v = p.ultima('jogo')?.vista;
      const d = v?.decision;
      if (!v || !d || respondidas.has(`${i}:${d.id}`)) continue;
      if (parar(p, d, v)) return { p, d };
      respondidas.add(`${i}:${d.id}`);
      g.tratar(p, respostaPadrao(d));
      andou = true;
    }
    if (!andou) await espera(5);
  }
  throw new Error('a situação esperada não chegou');
}

const temTerreno = (d: Decision, v: GameView) => d.kind === 'priority' && v.turn.active === v.you && d.actions.some((a) => a.kind === 'play');

/** quem está no próprio turno com um terreno para jogar joga; devolve quem jogou e o terreno */
async function jogarTerreno(g: Gerente, ps: Falsa[]) {
  const { p, d } = await conduzir(g, ps, (_, d, v) => temTerreno(d, v));
  const acao = (d as Extract<Decision, { kind: 'priority' }>).actions.find((a) => a.kind === 'play')!;
  const terreno = p.vista.hand.find((c) => c.id === acao.obj)!.def;
  const antes = { mao: p.vista.hand.map((c) => c.id), turno: p.vista.turn.number, decisao: d.id, campo: noCampo(p, terreno) };
  g.tratar(p, { t: 'responder', decisao: d.id, resposta: { kind: 'priority', action: acao.id } });
  await espera();
  expect(noCampo(p, terreno)).toBe(antes.campo + 1);
  return { p, terreno, antes };
}

/** quantas cópias desta carta a pessoa controla no campo (o objeto muda de número ao trocar de zona) */
const noCampo = (p: Falsa, def: string) => p.vista.battlefield.filter((o) => o.def === def && o.controller === p.assento).length;

/** pede para desfazer e confere que o servidor não recusou */
function pedir(g: Gerente, p: Falsa) {
  const n = p.msgs.length;
  g.tratar(p, { t: 'desfazer' });
  const erro = p.msgs.slice(n).find((m) => m.t === 'erro') as Extract<MsgServidor, { t: 'erro' }> | undefined;
  expect(erro?.msg).toBeUndefined();
}

describe('fase 8: regra de auxílios da sala', () => {
  it('só quem criou a sala escolhe; a regra aparece para todos e não muda com a partida em andamento', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const { ana, bruno } = sala(g);
    expect(ana.ultima('sala')!.sala.auxilios).toBe('permitidos');
    g.tratar(bruno, { t: 'auxilios', regra: 'proibidos' });
    expect(bruno.ultima('erro')?.msg).toMatch(/criou a sala/);
    g.tratar(ana, { t: 'auxilios', regra: 'proibidos' });
    expect(bruno.ultima('sala')!.sala.auxilios).toBe('proibidos');
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    g.tratar(ana, { t: 'auxilios', regra: 'permitidos' });
    expect(ana.ultima('erro')?.msg).toMatch(/já começou/);
  });

  it('sala sem auxílios: o servidor recusa o pagamento automático; com auxílios, aceita', async () => {
    for (const regra of ['proibidos', 'permitidos'] as const) {
      const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
      const { ana } = sala(g, { bruno: false, auxilios: regra });
      g.tratar(ana, { t: 'iniciar' });
      // Ana joga terrenos e conjura a primeira mágica que der; o pagamento é a decisão testada
      let pagamento: Decision | null = null;
      for (let k = 0; k < 600 && !pagamento; k++) {
        await espera();
        const d = ana.ultima('jogo')?.vista.decision;
        if (!d) { await espera(2); continue; }
        if (d.kind === 'payment') { pagamento = d; break; }
        const acao = d.kind === 'priority' ? d.actions.find((a) => a.kind === 'play') ?? d.actions.find((a) => a.kind === 'cast') : undefined;
        if (acao) g.tratar(ana, { t: 'responder', decisao: d.id, resposta: { kind: 'priority', action: acao.id } });
        else g.tratar(ana, respostaPadrao(d));
      }
      expect(pagamento, regra).not.toBeNull();
      const antes = ana.msgs.length;
      g.tratar(ana, { t: 'responder', decisao: pagamento!.id, resposta: { kind: 'payment', auto: true } });
      const erro = ana.msgs.slice(antes).find((m) => m.t === 'erro') as Extract<MsgServidor, { t: 'erro' }> | undefined;
      if (regra === 'proibidos') {
        expect(erro?.msg).toMatch(/não permite pagamento automático/);
        expect(ana.vista.decision?.id).toBe(pagamento!.id);
      } else expect(erro).toBeUndefined();
    }
  }, 120000);

  it('sem auxílios, a mesa para nas suas paradas mesmo sem jogada possível', async () => {
    // com auxílios (padrão), quem não tem nada para fazer nunca recebe a prioridade
    const semJogada = (d: Decision) => d.kind === 'priority' && d.actions.every((a) => a.kind === 'pass' || a.kind === 'mana' || a.kind === 'manual');
    for (const regra of ['permitidos', 'proibidos'] as const) {
      const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
      const { ana } = sala(g, { bruno: false, auxilios: regra });
      g.tratar(ana, { t: 'iniciar' });
      let viu = false;
      try {
        await conduzir(g, [ana], (_, d, v) => { if (semJogada(d)) viu = true; return viu || v.turn.number > 6; }, 600);
      } catch { /* chegou ao limite */ }
      expect(viu, regra).toBe(regra === 'proibidos');
    }
  }, 120000);
});

describe('fase 8: desfazer com aceite da mesa', () => {
  it('aceito: a jogada volta, o banco é cortado e a partida retomada depois de reiniciar fica igual', async () => {
    const banco = new Banco(':memory:');
    const g = new Gerente(banco, DECKS, SEM_ATRASO);
    const { ana, bruno, codigo } = sala(g);
    pararSempre(g, [ana, bruno]);
    g.tratar(ana, { t: 'iniciar' });
    const { p, terreno, antes } = await jogarTerreno(g, [ana, bruno]);
    const outro = p === ana ? bruno : ana;
    expect(p.ultima('jogo')!.desfazivel).toBe(true);
    expect(outro.ultima('jogo')!.desfazivel).toBe(false);
    pedir(g, p);
    const pedido = outro.ultima('jogo')!.desfazer!;
    expect(pedido.de).toBe(p.assento);
    expect(pedido.faltam).toEqual([outro.assento]);
    expect(pedido.linhas[0].texto).toMatch(/joga/);
    // a mesa fica parada: ninguém responde decisões enquanto o pedido está aberto
    const d = p.vista.decision!;
    g.tratar(p, respostaPadrao(d));
    expect(p.ultima('erro')?.msg).toMatch(/parada/);
    g.tratar(outro, { t: 'desfazerResposta', aceitar: true });
    await espera();
    expect(p.vista.hand.map((c) => c.id).sort()).toEqual([...antes.mao].sort());
    expect(noCampo(p, terreno)).toBe(antes.campo);
    expect(p.vista.decision?.id).toBe(antes.decisao);
    expect(p.ultima('jogo')!.desfazer).toBeNull();
    expect(outro.ultima('aviso')?.msg).toMatch(/desfez/);
    const s = g.salas.get(codigo)!;
    expect(banco.entradas(codigo).length).toBe(s.game!.inputs.length);
    // reinício: a partida volta igual, sem a jogada desfeita
    const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
    g2.restaurar();
    await espera();
    expect(JSON.stringify(g2.salas.get(codigo)!.game!.state)).toBe(JSON.stringify(s.game!.state));
  }, 60000);

  it('recusado: nada muda e a mesa segue', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const { ana, bruno } = sala(g);
    pararSempre(g, [ana, bruno]);
    g.tratar(ana, { t: 'iniciar' });
    const { p, terreno, antes } = await jogarTerreno(g, [ana, bruno]);
    const outro = p === ana ? bruno : ana;
    pedir(g, p);
    g.tratar(outro, { t: 'desfazerResposta', aceitar: false });
    await espera();
    expect(noCampo(p, terreno)).toBe(antes.campo + 1);
    expect(p.ultima('jogo')!.desfazer).toBeNull();
    expect(p.ultima('aviso')?.msg).toMatch(/recusou/);
    // a partida continua: a decisão pendente aceita resposta de novo
    const d = p.vista.decision!;
    g.tratar(p, respostaPadrao(d));
    expect(p.ultima('erro')?.msg ?? '').not.toMatch(/parada/);
  }, 60000);

  it('sem resposta no prazo: o pedido cai e nada muda', async () => {
    const atrasos: Atrasos = { ...SEM_ATRASO, prazoDesfazer: 40 };
    const g = new Gerente(new Banco(':memory:'), DECKS, atrasos);
    const { ana, bruno } = sala(g);
    pararSempre(g, [ana, bruno]);
    g.tratar(ana, { t: 'iniciar' });
    const { p, terreno, antes } = await jogarTerreno(g, [ana, bruno]);
    pedir(g, p);
    expect(p.ultima('jogo')!.desfazer).not.toBeNull();
    await espera(120);
    expect(p.ultima('jogo')!.desfazer).toBeNull();
    expect(p.ultima('aviso')?.msg).toMatch(/a tempo/);
    expect(noCampo(p, terreno)).toBe(antes.campo + 1);
  }, 60000);

  it('jogadas de outros depois da sua voltam junto, e o pedido mostra quais são', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const { ana, bruno } = sala(g);
    // as duas pessoas param na fase principal do turno do outro, mesmo sem jogada (ajuste manual entra aqui)
    for (const p of [ana, bruno]) g.tratar(p, { t: 'paradas', paradas: { myTurn: ['main1'], othersTurn: ['main1'], stopOnOpponentStack: true, stopOnOwnStack: false, passUntilTurnEnds: null, skipWhenNothing: false } });
    g.tratar(ana, { t: 'iniciar' });
    const { p } = await jogarTerreno(g, [ana, bruno]);
    const outro = p === ana ? bruno : ana;
    // quem jogou passa a prioridade na fase principal; o outro recebe e ganha 1 de vida no ajuste manual
    const d1 = p.vista.decision!;
    expect(d1.kind).toBe('priority');
    g.tratar(p, { t: 'responder', decisao: d1.id, resposta: { kind: 'priority', action: 'pass' } });
    await espera();
    const d2 = outro.vista.decision!;
    expect(d2.kind).toBe('priority');
    const vidaAntes = outro.vista.players[outro.assento!].life;
    g.tratar(outro, { t: 'responder', decisao: d2.id, resposta: { kind: 'priority', action: 'manual', manual: { k: 'vida', player: outro.assento!, delta: 1 } } });
    await espera();
    expect(outro.vista.players[outro.assento!].life).toBe(vidaAntes + 1);
    // desfazer o passe de quem jogou leva junto o ajuste do outro
    pedir(g, p);
    const pedido = outro.ultima('jogo')!.desfazer!;
    expect(pedido.linhas[0]).toMatchObject({ texto: expect.stringMatching(/passa a prioridade/), outro: false });
    expect(pedido.linhas.some((l) => l.outro && /ajuste manual/.test(l.texto))).toBe(true);
    g.tratar(outro, { t: 'desfazerResposta', aceitar: true });
    await espera();
    expect(outro.vista.players[outro.assento!].life).toBe(vidaAntes);
    expect(p.vista.decision?.id).toBe(d1.id);
  }, 60000);

  it('jogada de um turno que já passou não se desfaz; o pedido é recusado na hora', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const { ana, bruno } = sala(g);
    pararSempre(g, [ana, bruno]);
    g.tratar(ana, { t: 'iniciar' });
    const { p, antes } = await jogarTerreno(g, [ana, bruno]);
    g.tratar(p, { t: 'passarTurno' });
    await conduzir(g, [ana, bruno], (_, __, v) => v.turn.number > antes.turno);
    expect(p.ultima('jogo')!.desfazivel).toBe(false);
    g.tratar(p, { t: 'desfazer' });
    expect(p.ultima('erro')?.msg).toMatch(/Não há jogada sua para desfazer neste turno/);
  }, 60000);

  it('contra bots: eles aceitam na hora e a jogada volta sem pedido aberto', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const { ana } = sala(g, { bruno: false });
    pararSempre(g, [ana]);
    g.tratar(ana, { t: 'iniciar' });
    const { p, terreno, antes } = await jogarTerreno(g, [ana]);
    pedir(g, p);
    await espera();
    expect(noCampo(p, terreno)).toBe(antes.campo);
    expect(p.vista.hand.map((c) => c.id).sort()).toEqual([...antes.mao].sort());
    expect(p.ultima('jogo')!.desfazer).toBeNull();
  }, 60000);
});
