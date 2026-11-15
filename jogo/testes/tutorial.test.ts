// Como jogar (cliente/src/tutorial): o inglês acompanha o português passo a passo, cada passo tem o seu trecho do
// filme e na mesma ordem, o filme anda sem buracos, e as cartas ficam dentro do palco.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ATORES, CARTA_EXEMPLO, CENAS, FILME, FIM, MARCAS, MUNDO, cenaEm, estadoEm, marcaEm } from '../cliente/src/tutorial/filme.ts';
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

  it('nenhum texto ficou vazio e os termos [[ ]] fecham', () => {
    const ruins: string[] = [];
    const andar = (x: unknown, caminho: string): void => {
      if (typeof x === 'string') { if (!x.trim() || (x.match(/\[\[/g)?.length ?? 0) !== (x.match(/\]\]/g)?.length ?? 0)) ruins.push(caminho); }
      else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) andar(v, `${caminho}.${k}`);
    };
    andar(TEXTOS, 'TEXTOS');
    expect(ruins).toEqual([]);
  });

  it('cada passo do texto tem o seu trecho do filme, na mesma ordem', () => {
    expect(TEXTOS.pt.capitulos.flatMap((c) => c.passos.map((p) => p.cena))).toEqual(CENAS);
  });

  it('os trechos se emendam: cada um começa onde o anterior termina e o último acaba no fim do filme', () => {
    let fim = 0;
    for (const t of FILME.trechos) {
      expect(t.de, t.cena).toBe(fim);
      expect(t.passos, t.cena).toBeGreaterThan(0);
      fim = t.de + t.passos;
    }
    expect(fim).toBe(FIM);
  });

  it('em qualquer ponto do filme as cartas visíveis ficam dentro do palco e nada vira NaN', () => {
    for (let pos = 0; pos <= FIM; pos += 0.125) {
      const c = cenaEm(pos);
      expect(Number.isFinite(c.cam.x + c.cam.y + c.cam.z + c.vida[0] + c.vida[1]), `cena ${pos}`).toBe(true);
      for (const id of ATORES) {
        const e = estadoEm(pos, id);
        expect(Number.isFinite(e.x + e.y + e.r + e.s + e.face + e.o), `${id} em ${pos}`).toBe(true);
        if (e.o > 0.05) {
          expect(e.x, `${id} em ${pos}`).toBeGreaterThan(0);
          expect(e.x, `${id} em ${pos}`).toBeLessThan(MUNDO.w);
          expect(e.y, `${id} em ${pos}`).toBeGreaterThan(0);
          expect(e.y, `${id} em ${pos}`).toBeLessThan(MUNDO.h);
        }
      }
      for (const id of Object.keys(MARCAS)) expect(Number.isFinite(marcaEm(pos, id).o), `${id} em ${pos}`).toBe(true);
    }
  });

  it('toda marca do palco tem texto nos dois idiomas (ou é um número/símbolo fixo)', () => {
    for (const m of Object.values(MARCAS)) {
      const fixo = !/^[a-zA-Z]+$/.test(m.t);
      if (!fixo) for (const idioma of ['pt', 'en'] as const) expect((TEXTOS[idioma].palco.marcas as Record<string, string>)[m.t], `${idioma}: ${m.t}`).toBeTruthy();
    }
  });

  it('a carta do "Como ler uma carta" existe no catálogo do jogo', () => {
    const { cartas } = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'gerado', 'cartas.json'), 'utf8')) as { cartas: Record<string, unknown> };
    expect(cartas[CARTA_EXEMPLO]).toBeDefined();
  });
});
