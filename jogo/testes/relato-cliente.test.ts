// Relato de erro, no cliente: o registro das últimas ações (que vai junto do relato) nunca leva a senha da sala nem o
// token do assento.
import { describe, expect, it } from 'vitest';
import { diagnostico, registrarEnvio } from '../cliente/src/relato/diagnostico.ts';

describe('relato de erro: registro das ações', () => {
  it('esconde senha e token, e deixa o resto', () => {
    registrarEnvio({ t: 'criar', nome: 'Ana', senhaSala: 'segredo-1' } as { t: string });
    registrarEnvio({ t: 'entrar', codigo: 'ABCD', senhaSala: 'segredo-2', nome: 'Bia' } as { t: string });
    registrarEnvio({ t: 'retomar', codigo: 'ABCD', token: 'tok-123' } as { t: string });
    registrarEnvio({ t: 'ping' });
    const texto = JSON.stringify(diagnostico().enviadas);
    for (const s of ['segredo-1', 'segredo-2', 'tok-123']) expect(texto).not.toContain(s);
    expect(diagnostico().enviadas.map((o) => JSON.parse(o.texto).t)).toEqual(['criar', 'entrar', 'retomar']);
    expect(texto).toContain('ABCD');
  });
});
