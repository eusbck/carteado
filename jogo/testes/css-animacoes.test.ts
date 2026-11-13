// Revisão 2 do estudo do Arena, desempenho-3.1: animação no CSS só mexe em transform, translate, rotate, scale e
// opacity, que o navegador faz na placa de vídeo sem repintar. Um brilho que pulsa é desenhado uma vez num ::after e
// só a opacidade dele anima (como .realce-bloqueavel::after). Uma exceção de verdade (uma entrada que roda uma vez só)
// leva um comentário `/* repinta: motivo */` dentro do @keyframes, e este teste deixa passar.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const RAIZ = join(import.meta.dirname, '..', 'cliente', 'src');
const PERMITIDAS = new Set(['transform', 'translate', 'rotate', 'scale', 'opacity']);

const arquivosCss = (): string[] =>
  readdirSync(RAIZ, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.css')).map((f) => join(RAIZ, f));

interface Quadros { arquivo: string; nome: string; linha: number; corpo: string }

/** cada @keyframes do texto, com o corpo inteiro (chaves aninhadas) */
function lerKeyframes(css: string, arquivo = ''): Quadros[] {
  const saida: Quadros[] = [];
  const re = /@keyframes\s+([\w-]+)\s*\{/g;
  for (let m = re.exec(css); m; m = re.exec(css)) {
    let i = re.lastIndex, nivel = 1;
    while (nivel > 0 && i < css.length) {
      if (css[i] === '{') nivel++;
      else if (css[i] === '}') nivel--;
      i++;
    }
    saida.push({ arquivo, nome: m[1], linha: css.slice(0, m.index).split('\n').length, corpo: css.slice(re.lastIndex, i - 1) });
  }
  return saida;
}

/** as propriedades animadas fora da lista; vazio se o @keyframes é só de composição ou tem a exceção marcada */
function proibidas(q: Pick<Quadros, 'corpo'>): string[] {
  if (/\/\*\s*repinta:/.test(q.corpo)) return [];
  const semComentarios = q.corpo.replace(/\/\*[\s\S]*?\*\//g, '');
  const props = [...semComentarios.matchAll(/([a-z-]+)\s*:/g)].map((x) => x[1]);
  return [...new Set(props.filter((p) => !PERMITIDAS.has(p)))];
}

describe('animações do CSS só em transform e opacity (desempenho-3.1)', () => {
  it('o leitor acha o corpo e a regra pega box-shadow, filter e as exceções', () => {
    const [a, b, c] = lerKeyframes('@keyframes a { 50% { box-shadow: 0 0 4px red; } }\n@keyframes b { from { opacity: 0; scale: .5; } }\n@keyframes c { /* repinta: entrada */ from { filter: blur(4px); } }');
    expect([a.nome, b.nome, c.nome]).toEqual(['a', 'b', 'c']);
    expect(proibidas(a)).toEqual(['box-shadow']);
    expect(proibidas(b)).toEqual([]);
    expect(proibidas(c)).toEqual([]);
  });

  it('nenhum @keyframes do cliente anima algo que repinta sem dizer por quê', () => {
    const erros = arquivosCss().flatMap((f) => lerKeyframes(readFileSync(f, 'utf8'), f.slice(RAIZ.length + 1)))
      .map((q) => ({ q, p: proibidas(q) }))
      .filter((x) => x.p.length > 0)
      .map(({ q, p }) => `${q.arquivo}:${q.linha} @keyframes ${q.nome}: ${p.join(', ')}`);
    expect(erros).toEqual([]);
  });
});
