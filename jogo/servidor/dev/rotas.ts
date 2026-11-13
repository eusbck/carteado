// Rotas da área do desenvolvedor (/api/dev/*). Tudo aqui exige a sessão do desenvolvedor (acesso.ts); sem ela, e de
// fora do computador quando DEV_REMOTO não está ligado, a resposta é 404, como se a área não existisse.
//
//   POST /api/dev/entrar {chave}            GET /api/dev/sessao            POST /api/dev/sair
//   GET  /api/dev/resumo                     saúde do servidor, versão, salas, contadores
//   GET  /api/dev/relatos                    os relatos de erro (sem o contexto pesado)
//   GET  /api/dev/relatos/<id>               um relato inteiro + arquivos da pasta + última reprodução
//   GET  /api/dev/relatos/<id>/arquivo/<n>   imagem ou json da pasta do relato
//   POST /api/dev/relatos/<id>/estado        {estado: 'aberto'|'resolvido', nota}
//   POST /api/dev/relatos/<id>/reproduzir    refaz a partida com o motor de agora (processo separado)
//   GET  /api/dev/erros                      erros automáticos do navegador, agrupados
//   POST /api/dev/erros/<assinatura>         {resolvido: bool} ou {apagar: true}
//   GET  /api/dev/diario                     erros, avisos e mensagens do servidor (memória)
//   GET  /api/dev/salas                      salas e partidas (só o que é público na mesa: nada de mão ou grimório)
//   GET  /api/dev/decks                      decks jogáveis, em preparação e as cartas que faltam implementar
//   GET  /api/dev/acesso                     sessões abertas e registro de acessos;  POST /api/dev/acesso {encerrar}

import { execFile, spawn } from 'node:child_process';
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { join } from 'node:path';
import { monitorEventLoopDelay } from 'node:perf_hooks';
import type { Catalogo } from '../catalogo/catalogo.ts';
import { diarioCompleto } from '../diario-erros.ts';
import type { Arquivos } from '../http-arquivos.ts';
import { numeroCurto, type RelatoGravado, type Relatos } from '../relatos.ts';
import type { Gerente } from '../salas.ts';
import type { AcessoDev } from './acesso.ts';
import type { ErrosCliente } from './erros-cliente.ts';

export interface OpcoesRotasDev {
  raiz: string;
  acesso: AcessoDev;
  relatos: Relatos;
  erros: ErrosCliente;
  gerente: Gerente;
  catalogo: Catalogo;
  arquivos: Arquivos;
  versao: string | null;
  iniciadoEm: string;
  conexoes: () => number;
  decksJogaveis: () => number;
}

interface Reproducao { rodando: boolean; inicio: number; fim: number | null; codigo: number | null; saida: string }

const ID_RELATO = /^\d{8}-\d{6}-[a-z0-9]{4}$/;

function json(res: ServerResponse, status: number, corpo: unknown, extra: Record<string, string> = {}): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra });
  res.end(JSON.stringify(corpo));
}

async function lerJson(req: IncomingMessage, limite = 8192): Promise<Record<string, unknown>> {
  const partes: Buffer[] = [];
  let n = 0;
  for await (const p of req as AsyncIterable<Buffer>) {
    n += p.length;
    if (n > limite) throw new Error('grande');
    partes.push(p);
  }
  const v = JSON.parse(Buffer.concat(partes).toString('utf8') || '{}');
  return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
}

/** POST de outra página (CSRF): o cookie já é SameSite=Strict, e isto fecha o resto */
function postDeFora(req: IncomingMessage): boolean {
  if (req.headers['sec-fetch-site'] === 'cross-site') return true;
  const origem = req.headers.origin;
  if (origem && origem !== 'null') {
    try { if (new URL(origem).host !== req.headers.host) return true; } catch { return true; }
  }
  return !String(req.headers['content-type'] ?? '').startsWith('application/json');
}

export class RotasDev {
  private o: OpcoesRotasDev;
  private reproducoes = new Map<string, Reproducao>();
  private atraso = monitorEventLoopDelay({ resolution: 20 });
  private git: { em: number; dados: Record<string, string | number> | null; pedindo: boolean } = { em: 0, dados: null, pedindo: false };

  constructor(o: OpcoesRotasDev) {
    this.o = o;
    this.atraso.enable();
    this.gitInfo();
  }

  /** trata o pedido se for da área; false quando o caminho não é dela */
  async tratar(req: IncomingMessage, res: ServerResponse, p: string): Promise<boolean> {
    if (!p.startsWith('/api/dev/') && p !== '/api/dev') return false;
    const { acesso } = this.o;
    const metodo = req.method ?? 'GET';
    if (!acesso.alcancavel(req)) { json(res, 404, { erro: 'Rota desconhecida' }); return true; }
    if (metodo === 'POST' && postDeFora(req)) { json(res, 403, { erro: 'Pedido recusado' }); return true; }

    if (p === '/api/dev/entrar' && metodo === 'POST') {
      let chave = '';
      try { chave = String((await lerJson(req, 2048)).chave ?? ''); } catch { json(res, 400, { erro: 'Pedido inválido' }); return true; }
      const r = acesso.entrar(req, chave);
      if ('erro' in r) json(res, r.status, { erro: r.erro });
      else json(res, 200, { ok: true }, { 'set-cookie': r.cookie });
      return true;
    }
    const sessao = acesso.sessao(req);
    if (p === '/api/dev/sessao') { json(res, 200, { ok: !!sessao }); return true; }
    if (!sessao) { json(res, 401, { erro: 'Entre com a chave do desenvolvedor' }); return true; }
    if (p === '/api/dev/sair' && metodo === 'POST') { json(res, 200, { ok: true }, { 'set-cookie': acesso.sair(req) }); return true; }

    try {
      if (metodo === 'GET') {
        if (p === '/api/dev/resumo') { json(res, 200, this.resumo()); return true; }
        if (p === '/api/dev/relatos') { json(res, 200, this.o.relatos.listar().map(resumoRelato)); return true; }
        if (p === '/api/dev/erros') { json(res, 200, this.o.erros.listar()); return true; }
        if (p === '/api/dev/diario') { json(res, 200, diarioCompleto()); return true; }
        if (p === '/api/dev/salas') { json(res, 200, [...this.o.gerente.salas.values()].map((s) => s.paraDev())); return true; }
        if (p === '/api/dev/decks') { json(res, 200, this.decks()); return true; }
        if (p === '/api/dev/acesso') { json(res, 200, { sessoes: acesso.sessoes(sessao), acessos: acesso.acessos(), remoto: acesso.remoto }); return true; }
        let m = p.match(/^\/api\/dev\/relatos\/([\w-]+)$/);
        if (m) return this.relato(res, m[1]);
        m = p.match(/^\/api\/dev\/relatos\/([\w-]+)\/arquivo\/([\w.-]+)$/);
        if (m) return this.arquivoRelato(req, res, m[1], m[2]);
      }
      if (metodo === 'POST') {
        let corpo: Record<string, unknown>;
        try { corpo = await lerJson(req); } catch { json(res, 400, { erro: 'Pedido inválido' }); return true; }
        let m = p.match(/^\/api\/dev\/relatos\/([\w-]+)\/estado$/);
        if (m) {
          if (!this.existe(m[1])) { json(res, 404, { erro: 'Relato não encontrado' }); return true; }
          const estado = corpo.estado === 'resolvido' ? 'resolvido' : 'aberto';
          this.o.relatos.marcar(m[1], estado, typeof corpo.nota === 'string' ? corpo.nota.slice(0, 2000) : '');
          json(res, 200, { ok: true });
          return true;
        }
        m = p.match(/^\/api\/dev\/relatos\/([\w-]+)\/reproduzir$/);
        if (m) {
          if (!this.existe(m[1])) { json(res, 404, { erro: 'Relato não encontrado' }); return true; }
          json(res, 200, this.reproduzir(m[1]));
          return true;
        }
        m = p.match(/^\/api\/dev\/erros\/([0-9a-f]{16})$/);
        if (m) {
          const ok = corpo.apagar === true ? this.o.erros.apagar(m[1]) : this.o.erros.marcar(m[1], corpo.resolvido === true);
          json(res, ok ? 200 : 404, ok ? { ok } : { erro: 'Erro não encontrado' });
          return true;
        }
        if (p === '/api/dev/acesso') {
          const n = acesso.encerrar(sessao, typeof corpo.encerrar === 'string' && /^[0-9a-f]{12}$/.test(corpo.encerrar) ? corpo.encerrar : null);
          json(res, 200, { ok: true, encerradas: n });
          return true;
        }
      }
    } catch (e) {
      console.error('área do desenvolvedor:', e);
      json(res, 500, { erro: e instanceof Error ? e.message : String(e) });
      return true;
    }
    json(res, 404, { erro: 'Rota desconhecida' });
    return true;
  }

  private existe(id: string): boolean {
    return ID_RELATO.test(id) && existsSync(join(this.o.relatos.pastaDe(id), 'relato.json'));
  }

  private relato(res: ServerResponse, id: string): true {
    if (!this.existe(id)) { json(res, 404, { erro: 'Relato não encontrado' }); return true; }
    const r = this.o.relatos.listar().find((x) => x.id === id)!;
    const pasta = this.o.relatos.pastaDe(id);
    const arquivos = readdirSync(pasta).filter((f) => !f.startsWith('.')).map((f) => ({ nome: f, bytes: statSync(join(pasta, f)).size }));
    json(res, 200, { relato: r, numero: numeroCurto(id), arquivos, reproducao: this.reproducoes.get(id) ?? null, versaoAgora: this.o.versao });
    return true;
  }

  private async arquivoRelato(req: IncomingMessage, res: ServerResponse, id: string, nome: string): Promise<true> {
    const caminho = join(this.o.relatos.pastaDe(id), nome);
    if (!this.existe(id) || nome.startsWith('.') || !existsSync(caminho) || !statSync(caminho).isFile()) { json(res, 404, { erro: 'Arquivo não encontrado' }); return true; }
    if (nome.endsWith('.json')) res.setHeader('content-disposition', `attachment; filename="relato-${numeroCurto(id)}-${nome}"`);
    await this.o.arquivos.arquivo(req, res, caminho, 'private, no-store');
    return true;
  }

  /** refaz a partida do relato num processo à parte (o motor pode levar segundos e não pode travar as mesas) */
  private reproduzir(id: string): Reproducao {
    const atual = this.reproducoes.get(id);
    if (atual?.rodando) return atual;
    if ([...this.reproducoes.values()].some((r) => r.rodando)) return { rodando: false, inicio: Date.now(), fim: Date.now(), codigo: -1, saida: 'Já há outra reprodução rodando; espere ela terminar.' };
    const r: Reproducao = { rodando: true, inicio: Date.now(), fim: null, codigo: null, saida: '' };
    this.reproducoes.set(id, r);
    const proc = spawn(process.execPath, ['ferramentas/relatos.ts', 'reproduzir', id], {
      cwd: this.o.raiz, env: { ...process.env, RELATOS: this.o.relatos.pasta }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
    });
    const juntar = (d: Buffer) => { r.saida = (r.saida + String(d)).slice(-60_000); };
    proc.stdout.on('data', juntar);
    proc.stderr.on('data', juntar);
    const limite = setTimeout(() => { r.saida += '\n[parado: passou de 3 minutos]'; proc.kill(); }, 180_000);
    proc.on('error', (e) => { r.saida += `\n[não rodou: ${e.message}]`; });
    proc.on('close', (codigo) => {
      clearTimeout(limite);
      r.rodando = false;
      r.fim = Date.now();
      r.codigo = codigo;
      try { writeFileSync(join(this.o.relatos.pastaDe(id), 'reproducao.txt'), `${new Date(r.fim).toISOString()} código ${codigo}\n\n${r.saida}`); } catch { /* a pasta sumiu */ }
    });
    return r;
  }

  /** git: ramo, commit e alterações não gravadas da pasta que roda. Devolve o que já sabe e, passado um minuto, pede
   * de novo em segundo plano (o git status deste repositório, com as imagens das cartas, leva segundos) */
  private gitInfo(): Record<string, string | number> | null {
    if (Date.now() - this.git.em >= 60_000 && !this.git.pedindo) {
      this.git.pedindo = true;
      const rodar = (args: string[]) => new Promise<string>((ok) => execFile('git', args, { cwd: this.o.raiz, timeout: 30_000, windowsHide: true }, (e, out) => ok(e ? '' : String(out).trim())));
      void Promise.all([rodar(['rev-parse', '--abbrev-ref', 'HEAD']), rodar(['log', '-1', '--format=%h %cI %s']), rodar(['status', '--porcelain', '--untracked-files=no', '--', '.'])]).then(([ramo, ultimo, status]) => {
        this.git = { em: Date.now(), pedindo: false, dados: ramo ? { ramo, ultimo, alterados: status ? status.split('\n').length : 0 } : null };
      });
    }
    return this.git.dados;
  }

  private resumo(): Record<string, unknown> {
    const salas = [...this.o.gerente.salas.values()];
    const porEstado: Record<string, number> = {};
    for (const s of salas) porEstado[s.d.estado] = (porEstado[s.d.estado] ?? 0) + 1;
    const relatos = this.o.relatos.listar();
    const erros = this.o.erros.listar();
    const diario = diarioCompleto();
    const hora = Date.now() - 3600_000;
    const mem = process.memoryUsage();
    const ms = (n: number) => Math.round(n / 1e5) / 10;
    const atraso = { p50: ms(this.atraso.percentile(50)), p99: ms(this.atraso.percentile(99)), max: ms(this.atraso.max) };
    this.atraso.reset();
    const decks = this.o.catalogo.todos();
    return {
      versao: this.o.versao, git: this.gitInfo(), iniciadoEm: this.o.iniciadoEm, segundosNoAr: Math.round(process.uptime()),
      node: process.version, plataforma: `${process.platform} ${process.arch}`, pid: process.pid,
      memoria: { rssMB: Math.round(mem.rss / 1048576), heapMB: Math.round(mem.heapUsed / 1048576), heapTotalMB: Math.round(mem.heapTotal / 1048576) },
      atrasoLacoMs: atraso,
      conexoes: this.o.conexoes(),
      salas: { total: salas.length, porEstado, comErro: salas.filter((s) => s.erro).length, pessoasConectadas: salas.reduce((n, s) => n + s.conexoes.size, 0) },
      relatos: { abertos: relatos.filter((r) => r.estado === 'aberto').length, total: relatos.length, ultimo: relatos[0]?.em ?? null },
      errosCliente: { abertos: erros.filter((e) => !e.resolvido).length, ocorrencias24h: erros.filter((e) => e.ultimo > Date.now() - 86400_000).reduce((n, e) => n + e.vezes24h, 0) },
      servidor: { erros1h: diario.filter((l) => l.em >= hora && l.nivel === 'erro').length, avisos1h: diario.filter((l) => l.em >= hora && l.nivel === 'aviso').length },
      decks: { total: decks.length, jogaveis: this.o.decksJogaveis(), emPreparacao: decks.filter((d) => d.preparacao).length },
    };
  }

  /** a fronteira do catálogo: o que cada deck ainda espera e as cartas sem regra, das mais pedidas para as menos */
  private decks(): Record<string, unknown> {
    const { catalogo } = this.o;
    const cartas = new Map<string, Set<string>>();
    const decks = catalogo.todos().map((d) => {
      const faltamAtual = d.atual ? catalogo.faltam(d.atual) : [];
      const faltamPrep = d.preparacao ? catalogo.faltam(d.preparacao) : [];
      for (const n of new Set([...faltamAtual, ...faltamPrep])) {
        if (!cartas.has(n)) cartas.set(n, new Set());
        cartas.get(n)!.add(d.nome);
      }
      const l = d.atual ?? d.preparacao;
      return {
        id: d.id, nome: d.nome, comandante: l?.comandante ?? null, formato: l?.formato ?? 'commander',
        jogavel: !!d.atual && faltamAtual.length === 0, temPreparacao: !!d.preparacao, faltamAtual, faltamPreparacao: faltamPrep,
      };
    });
    return {
      decks,
      cartasFaltando: [...cartas].map(([nome, ds]) => ({ nome, decks: [...ds].sort() })).sort((a, b) => b.decks.length - a.decks.length || a.nome.localeCompare(b.nome)),
    };
  }
}

function resumoRelato(r: RelatoGravado) {
  const c = r.contexto as { tela?: string; sala?: { codigo?: string } };
  return {
    id: r.id, numero: numeroCurto(r.id), em: r.em, estado: r.estado, resolucao: r.resolucao ?? null, tipo: r.tipo, repete: r.repete,
    oque: r.oque.slice(0, 400), nome: r.nome, cartas: r.cartas, imagens: r.imagens.map((i) => i.arquivo), partida: r.partida,
    tela: c.tela ?? null, sala: c.sala?.codigo ?? null, versao: (r.servidor as { versao?: string }).versao ?? null,
  };
}
