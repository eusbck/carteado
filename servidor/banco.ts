// Persistência em SQLite (node:sqlite): sessões de acesso, salas e as entradas de cada partida.
// A partida é reconstruída pela semente + entradas (a partir do último checkpoint), então
// sobrevive a reinícios do servidor.

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export class Banco {
  private db: DatabaseSync;

  constructor(arquivo: string) {
    if (arquivo !== ':memory:') mkdirSync(dirname(arquivo), { recursive: true });
    this.db = new DatabaseSync(arquivo);
    this.db.exec(`
      pragma journal_mode = wal;
      create table if not exists sessoes (token text primary key, criada integer not null);
      create table if not exists salas (codigo text primary key, dados text not null, atualizada integer not null);
      create table if not exists entradas (codigo text not null, n integer not null, json text not null, primary key (codigo, n));
    `);
    // fase 8: turno de cada entrada e se foi a pessoa que fez (para o Desfazer); bancos antigos ganham a coluna
    const colunas = (this.db.prepare('pragma table_info(entradas)').all() as { name: string }[]).map((c) => c.name);
    if (!colunas.includes('meta')) this.db.exec('alter table entradas add column meta text');
  }

  criarSessao(token: string): void { this.db.prepare('insert into sessoes (token, criada) values (?, ?)').run(token, Date.now()); }
  sessaoValida(token: string): boolean { return !!this.db.prepare('select 1 from sessoes where token = ?').get(token); }

  salvarSala(codigo: string, dados: unknown): void {
    this.db.prepare('insert into salas (codigo, dados, atualizada) values (?, ?, ?) on conflict(codigo) do update set dados = excluded.dados, atualizada = excluded.atualizada')
      .run(codigo, JSON.stringify(dados), Date.now());
  }
  salas(): { codigo: string; dados: unknown }[] {
    return (this.db.prepare('select codigo, dados from salas').all() as { codigo: string; dados: string }[]).map((r) => ({ codigo: r.codigo, dados: JSON.parse(r.dados) }));
  }
  apagarSala(codigo: string): void {
    this.db.prepare('delete from salas where codigo = ?').run(codigo);
    this.db.prepare('delete from entradas where codigo = ?').run(codigo);
  }

  adicionarEntradas(codigo: string, inicio: number, entradas: unknown[], metas: unknown[] = []): void {
    const st = this.db.prepare('insert or replace into entradas (codigo, n, json, meta) values (?, ?, ?, ?)');
    this.db.exec('begin');
    try {
      entradas.forEach((e, i) => st.run(codigo, inicio + i, JSON.stringify(e), metas[i] ? JSON.stringify(metas[i]) : null));
      this.db.exec('commit');
    } catch (e) {
      this.db.exec('rollback');
      throw e;
    }
  }
  entradas(codigo: string): unknown[] {
    return (this.db.prepare('select json from entradas where codigo = ? order by n').all(codigo) as { json: string }[]).map((r) => JSON.parse(r.json));
  }
  /** metadados de cada entrada, na mesma ordem (null nas gravadas antes da fase 8) */
  metas(codigo: string): unknown[] {
    return (this.db.prepare('select meta from entradas where codigo = ? order by n').all(codigo) as { meta: string | null }[]).map((r) => (r.meta ? JSON.parse(r.meta) : null));
  }
  limparEntradas(codigo: string): void { this.db.prepare('delete from entradas where codigo = ?').run(codigo); }
  /** apaga as entradas a partir da posição n (desfazer) */
  truncarEntradas(codigo: string, n: number): void { this.db.prepare('delete from entradas where codigo = ? and n >= ?').run(codigo, n); }

  fechar(): void { this.db.close(); }
}
