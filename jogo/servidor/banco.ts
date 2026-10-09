// Persistência em SQLite (node:sqlite): sessões de acesso, salas e as entradas de cada partida.
// A partida é reconstruída pela semente + entradas (a partir do último checkpoint), então
// sobrevive a reinícios do servidor.

import { DatabaseSync, type StatementSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

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
    `);
    // fase 8: turno de cada entrada e se foi a pessoa que fez (para o Desfazer); bancos antigos ganham a coluna
    const colunas = (this.db.prepare('pragma table_info(entradas)').all() as { name: string }[]).map((c) => c.name);
    if (!colunas.includes('meta')) this.db.exec('alter table entradas add column meta text');
    const p = (sql: string) => this.db.prepare(sql);
    this.st = {
      criarSessao: p('insert into sessoes (token, criada) values (?, ?)'),
      sessao: p('select 1 from sessoes where token = ?'),
      salvarSala: p('insert into salas (codigo, dados, atualizada) values (?, ?, ?) on conflict(codigo) do update set dados = excluded.dados, atualizada = excluded.atualizada'),
      salas: p('select codigo, dados from salas'),
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
  salas(): { codigo: string; dados: unknown }[] {
    return (this.st.salas.all() as { codigo: string; dados: string }[]).map((r) => ({ codigo: r.codigo, dados: JSON.parse(r.dados) }));
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

  fechar(): void { this.db.close(); }
}
