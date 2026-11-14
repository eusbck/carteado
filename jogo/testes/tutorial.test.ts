// Como jogar (cliente/src/tutorial): o inglês acompanha o português passo a passo, toda cena citada existe, toda cena
// é usada, e as cartas do palco existem no catálogo do jogo.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ATORES, CARTA_EXEMPLO, CENAS, estados } from '../cliente/src/tutorial/cenas.ts';
import { TEXTOS } from '../cliente/src/tutorial/textos.ts';

/** a forma de um objeto: as chaves, de cima a baixo (os textos em si ficam de fora) */
function forma(x: unknown): unknown {
  if (Array.isArray(x)) return x.map(forma);
  if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, k === 'cena' ? v : forma(v)]));
  return typeof x;
}

describe('Como jogar', () => {
  it('o inglês tem as mesmas chaves, capítulos, passos e cenas do português', () => {
    expect(forma(TEXTOS.en)).toEqual(forma(TEXTOS.pt));
  });

  it('nenhum texto ficou vazio', () => {
    const vazios: string[] = [];
    const andar = (x: unknown, caminho: string): void => {
      if (typeof x === 'string') { if (!x.trim()) vazios.push(caminho); }
      else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) andar(v, `${caminho}.${k}`);
    };
    andar(TEXTOS, 'TEXTOS');
    expect(vazios).toEqual([]);
  });

  it('cada passo aponta para uma cena que existe, sem repetir, e toda cena é usada', () => {
    const citadas = TEXTOS.pt.capitulos.flatMap((c) => c.passos.map((p) => p.cena));
    expect(new Set(citadas).size).toBe(citadas.length);
    expect([...citadas].sort()).toEqual(Object.keys(CENAS).sort());
  });

  it('os quadros ficam dentro do palco e o primeiro de cada cena não espera', () => {
    for (const [nome, quadros] of Object.entries(CENAS)) {
      expect(quadros.length, nome).toBeGreaterThan(0);
      expect(quadros[0].espera, nome).toBe(0);
      for (const q of quadros) {
        for (const e of Object.values(estados(q))) {
          expect(e.x, nome).toBeGreaterThanOrEqual(0);
          expect(e.x, nome).toBeLessThanOrEqual(100);
          expect(e.y, nome).toBeGreaterThanOrEqual(0);
          expect(e.y, nome).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('as cartas do palco existem no catálogo do jogo', () => {
    const { cartas } = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'gerado', 'cartas.json'), 'utf8')) as { cartas: Record<string, unknown> };
    for (const nome of [...Object.values(ATORES), CARTA_EXEMPLO]) expect(cartas[nome], nome).toBeDefined();
  });
});
