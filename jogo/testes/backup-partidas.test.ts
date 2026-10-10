import { describe, expect, it } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { copiarPartidas } from '../ferramentas/backup-partidas.ts';

describe('transferência consistente das partidas', () => {
  it('inclui as linhas confirmadas ainda no WAL, sem fechar ou modificar a conexão da mesa', async () => {
    const pasta = mkdtempSync(join(tmpdir(), 'commander-backup-decks-'));
    const source = join(pasta, 'origem.sqlite'), target = join(pasta, 'copia.sqlite');
    const db = new DatabaseSync(source);
    try {
      db.exec('PRAGMA journal_mode=WAL; PRAGMA wal_autocheckpoint=0; CREATE TABLE salas(codigo TEXT, dados TEXT);');
      db.prepare('INSERT INTO salas VALUES (?, ?)').run('mesa', '{"turno":7}');
      expect(existsSync(source + '-wal')).toBe(true);
      expect(await copiarPartidas(source, target)).toMatchObject({ integridade: 'ok' });
      const copy = new DatabaseSync(target, { readOnly: true });
      try { expect(copy.prepare('SELECT * FROM salas').all()).toEqual([{ codigo: 'mesa', dados: '{"turno":7}' }]); } finally { copy.close(); }
      db.prepare('INSERT INTO salas VALUES (?, ?)').run('outra', '{"turno":8}');
      expect(db.prepare('SELECT COUNT(*) AS n FROM salas').get()!.n).toBe(2);
      await expect(copiarPartidas(source, target)).rejects.toThrow('já existe');
      await expect(copiarPartidas(source, source)).rejects.toThrow('diferentes');
    } finally { db.close(); }
  });
});
