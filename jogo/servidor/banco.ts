// Persistência em SQLite (node:sqlite): sessões de acesso, salas e as entradas de cada partida.
// A partida é reconstruída pela semente + entradas (a partir do último checkpoint), então
// sobrevive a reinícios do servidor.

import { DatabaseSync, type StatementSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

/** um erro automático do navegador, agrupado pela assinatura (servidor/dev/erros-cliente.ts) */
export interface ErroClienteGravado {
  assinatura: string;
  tipo: 'erro' | 'promessa';
  texto: string;
  pilha: string;
  tela: string;
  navegador: string;
  primeiro: number;
  ultimo: number;
  vezes: number;
  /** vezes nas últimas 24 h (das últimas 100 ocorrências guardadas) */
  vezes24h: number;
  versao: string;
  /** navegadores diferentes (pelo hash do endereço) */
  pessoas: number;
  resolvido: boolean;
  resolvidoEm: number | null;
}

interface LinhaErroCliente {
  assinatura: string; tipo: string; texto: string; pilha: string; tela: string; navegador: string;
  primeiro: number; ultimo: number; vezes: number; versao: string; ips: string; recentes: string; resolvido: number; resolvido_em: number | null;
}

/** quantos erros diferentes o banco guarda (os mais antigos saem) */
const MAX_ERROS_CLIENTE = 500;

export class Banco {
  private db: DatabaseSync;
  /** comandos preparados uma vez só (antes, cada gravação preparava o seu de novo) */
  private st: Record<'criarSessao' | 'sessao' | 'salvarSala' | 'salas' | 'apagarSala' | 'apagarEntradas' | 'adicionarEntrada' | 'entradas' | 'metas' | 'truncarEntradas', StatementSync>;

  constructor(arquivo: string) {
    if (arquivo !== ':memory:') mkdirSync(dirname(arquivo), { recursive: true });
    this.db = new DatabaseSync(arquivo);
    // WAL com synchronous=normal: cada gravação deixa de esperar o disco (fsync) a cada commit; uma queda de energia
    // pode perder só as últimas gravações, e o banco continua íntegro
    this.db.exec(`
      pragma journal_mode = wal;
      pragma synchronous = normal;
      create table if not exists sessoes (token text primary key, criada integer not null);
      create table if not exists salas (codigo text primary key, dados text not null, atualizada integer not null);
      create table if not exists entradas (codigo text not null, n integer not null, json text not null, primary key (codigo, n));
      create table if not exists sessoes_dev (hash text primary key, criada integer not null, expira integer not null, ip text not null, agente text not null);
      create table if not exists erros_cliente (
        assinatura text primary key, tipo text not null, texto text not null, pilha text not null, tela text not null, navegador text not null,
        primeiro integer not null, ultimo integer not null, vezes integer not null, versao text not null, ips text not null, recentes text not null,
        resolvido integer not null default 0, resolvido_em integer
      );
    `);
    // fase 8: turno de cada entrada e se foi a pessoa que fez (para o Desfazer); bancos antigos ganham a coluna
    const colunas = (this.db.prepare('pragma table_info(entradas)').all() as { name: string }[]).map((c) => c.name);
    if (!colunas.includes('meta')) this.db.exec('alter table entradas add column meta text');
    const p = (sql: string) => this.db.prepare(sql);
    this.st = {
      criarSessao: p('insert into sessoes (token, criada) values (?, ?)'),
      sessao: p('select 1 from sessoes where token = ?'),
      salvarSala: p('insert into salas (codigo, dados, atualizada) values (?, ?, ?) on conflict(codigo) do update set dados = excluded.dados, atualizada = excluded.atualizada'),
      salas: p('select codigo, dados, atualizada from salas'),
      apagarSala: p('delete from salas where codigo = ?'),
      apagarEntradas: p('delete from entradas where codigo = ?'),
      adicionarEntrada: p('insert or replace into entradas (codigo, n, json, meta) values (?, ?, ?, ?)'),
      entradas: p('select json from entradas where codigo = ? order by n'),
      metas: p('select meta from entradas where codigo = ? order by n'),
      truncarEntradas: p('delete from entradas where codigo = ? and n >= ?'),
    };
  }

  criarSessao(token: string): void { this.st.criarSessao.run(token, Date.now()); }
  sessaoValida(token: string): boolean { return !!this.st.sessao.get(token); }

  salvarSala(codigo: string, dados: unknown): void {
    this.st.salvarSala.run(codigo, JSON.stringify(dados), Date.now());
  }
  /** as salas gravadas; `atualizada`: quando a sala foi gravada pela última vez (ms) */
  salas(): { codigo: string; dados: unknown; atualizada: number }[] {
    return (this.st.salas.all() as { codigo: string; dados: string; atualizada: number }[]).map((r) => ({ codigo: r.codigo, dados: JSON.parse(r.dados), atualizada: Number(r.atualizada) }));
  }
  apagarSala(codigo: string): void {
    this.st.apagarSala.run(codigo);
    this.st.apagarEntradas.run(codigo);
  }

  adicionarEntradas(codigo: string, inicio: number, entradas: unknown[], metas: unknown[] = []): void {
    this.db.exec('begin');
    try {
      entradas.forEach((e, i) => this.st.adicionarEntrada.run(codigo, inicio + i, JSON.stringify(e), metas[i] ? JSON.stringify(metas[i]) : null));
      this.db.exec('commit');
    } catch (e) {
      this.db.exec('rollback');
      throw e;
    }
  }
  entradas(codigo: string): unknown[] {
    return (this.st.entradas.all(codigo) as { json: string }[]).map((r) => JSON.parse(r.json));
  }
  /** metadados de cada entrada, na mesma ordem (null nas gravadas antes da fase 8) */
  metas(codigo: string): unknown[] {
    return (this.st.metas.all(codigo) as { meta: string | null }[]).map((r) => (r.meta ? JSON.parse(r.meta) : null));
  }
  limparEntradas(codigo: string): void { this.st.apagarEntradas.run(codigo); }
  /** apaga as entradas a partir da posição n (desfazer) */
  truncarEntradas(codigo: string, n: number): void { this.st.truncarEntradas.run(codigo, n); }

  // área do desenvolvedor: sessões (pelo hash do token) e erros automáticos do navegador
  criarSessaoDev(hash: string, criada: number, expira: number, ip: string, agente: string): void {
    this.db.prepare('delete from sessoes_dev where expira < ?').run(criada);
    this.db.prepare('insert into sessoes_dev (hash, criada, expira, ip, agente) values (?, ?, ?, ?, ?)').run(hash, criada, expira, ip, agente);
  }
  sessaoDev(hash: string): { expira: number } | null {
    return (this.db.prepare('select expira from sessoes_dev where hash = ?').get(hash) as { expira: number } | undefined) ?? null;
  }
  apagarSessaoDev(hash: string): void { this.db.prepare('delete from sessoes_dev where hash = ?').run(hash); }
  sessoesDev(): { hash: string; criada: number; expira: number; ip: string; agente: string }[] {
    return this.db.prepare('select hash, criada, expira, ip, agente from sessoes_dev order by criada desc').all() as never;
  }

  registrarErroCliente(e: { assinatura: string; tipo: string; texto: string; pilha: string; tela: string; navegador: string; em: number; versao: string; ip: string }): void {
    const atual = this.db.prepare('select ips, recentes from erros_cliente where assinatura = ?').get(e.assinatura) as { ips: string; recentes: string } | undefined;
    if (!atual) {
      this.db.prepare(`insert into erros_cliente (assinatura, tipo, texto, pilha, tela, navegador, primeiro, ultimo, vezes, versao, ips, recentes, resolvido)
        values (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, 0)`).run(e.assinatura, e.tipo, e.texto, e.pilha, e.tela, e.navegador, e.em, e.em, e.versao, JSON.stringify([e.ip]), JSON.stringify([e.em]));
      const n = (this.db.prepare('select count(*) as n from erros_cliente').get() as { n: number }).n;
      if (n > MAX_ERROS_CLIENTE) this.db.prepare('delete from erros_cliente where assinatura in (select assinatura from erros_cliente order by ultimo limit ?)').run(n - MAX_ERROS_CLIENTE);
      return;
    }
    const ips = new Set(JSON.parse(atual.ips) as string[]);
    if (ips.size < 200) ips.add(e.ip);
    const recentes = [...(JSON.parse(atual.recentes) as number[]), e.em].slice(-100);
    // voltou a acontecer: reabre
    this.db.prepare(`update erros_cliente set texto = ?, pilha = ?, tela = ?, navegador = ?, ultimo = ?, vezes = vezes + 1, versao = ?, ips = ?, recentes = ?, resolvido = 0, resolvido_em = null
      where assinatura = ?`).run(e.texto, e.pilha, e.tela, e.navegador, e.em, e.versao, JSON.stringify([...ips]), JSON.stringify(recentes), e.assinatura);
  }
  errosCliente(agora = Date.now()): ErroClienteGravado[] {
    return (this.db.prepare('select * from erros_cliente order by resolvido, ultimo desc').all() as unknown as LinhaErroCliente[]).map((l) => ({
      assinatura: l.assinatura, tipo: l.tipo === 'promessa' ? 'promessa' : 'erro', texto: l.texto, pilha: l.pilha, tela: l.tela, navegador: l.navegador,
      primeiro: l.primeiro, ultimo: l.ultimo, vezes: l.vezes, versao: l.versao,
      vezes24h: (JSON.parse(l.recentes) as number[]).filter((t) => agora - t < 86400_000).length,
      pessoas: (JSON.parse(l.ips) as string[]).length, resolvido: !!l.resolvido, resolvidoEm: l.resolvido_em,
    }));
  }
  marcarErroCliente(assinatura: string, resolvido: boolean): boolean {
    return Number(this.db.prepare('update erros_cliente set resolvido = ?, resolvido_em = ? where assinatura = ?').run(resolvido ? 1 : 0, resolvido ? Date.now() : null, assinatura).changes) > 0;
  }
  apagarErroCliente(assinatura: string): boolean {
    return Number(this.db.prepare('delete from erros_cliente where assinatura = ?').run(assinatura).changes) > 0;
  }

  fechar(): void { this.db.close(); }
}
