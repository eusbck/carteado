// Cartas próprias da mesa (as que não existem no Magic): decks do Lula e do Bolsonaro.
//
//   node ferramentas/cartas-proprias.ts dados              grava as cartas de proprias/cartas.json em decks/cartas.json
//   node ferramentas/cartas-proprias.ts imagens [nome...]  monta a imagem de cada carta em proprias/imagens/<id>/front.png
//   node ferramentas/cartas-proprias.ts                    as duas coisas
//
// A fonte é proprias/cartas.json, escrita à mão. Uma carta com "skinDe" copia custo, tipo, texto e força/resistência
// de uma carta que já está no jogo (a regra é a mesma; mudam o nome, a arte e a frase). A arte de cada carta vem de
// ../artes-brasil/<slug>.png; enquanto não houver, a carta sai com uma arte provisória.
// Depois de mudar os dados: node ferramentas/decks.ts gerar

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO } from '../servidor/catalogo/caminhos.ts';
import type { CartasGeradas, ImagensGeradas } from '../servidor/catalogo/gerar.ts';
import type { NovasCartas, Printing, ScryCard } from '../servidor/catalogo/tipos.ts';
import { slug } from './slug.ts';

export interface CartaPropria {
  nome: string;
  /** carta do jogo de onde vêm as regras e os dados */
  skinDe?: string;
  ficha?: boolean;
  /** layout do Oracle quando não é 'normal' (saga) */
  layout?: string;
  custo?: string;
  /** linha de tipo em inglês, como no Oracle (é a que o motor lê) */
  tipo?: string;
  tipoPt?: string;
  /** texto de regras em inglês */
  oracle?: string;
  /** texto de regras em português (o que aparece na carta) */
  texto?: string;
  forca?: number | string;
  resistencia?: number | string;
  palavras?: string[];
  /** só para fichas: as cores vêm do efeito que as cria */
  cores?: string[];
  frase?: string;
}

const PASTA = join(RAIZ_JOGO, 'proprias');
const PASTA_IMAGENS = join(PASTA, 'imagens');
const PASTA_ARTES = join(RAIZ_JOGO, '..', 'artes-brasil');
const PASTA_SIMBOLOS = join(RAIZ_JOGO, '..', 'cartas', 'assets', 'symbols');
const ORDEM_CORES = ['W', 'U', 'B', 'R', 'G'];

export function lerProprias(): { colecao: string; cartas: CartaPropria[] } {
  return JSON.parse(readFileSync(join(PASTA, 'cartas.json'), 'utf8'));
}

/** id fixo (formato de UUID) tirado do nome: a mesma carta tem sempre o mesmo id */
export function idDe(tipo: 'carta' | 'impressao', nome: string): string {
  const h = createHash('sha1').update(`brasil:${tipo}:${nome}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

const simbolosDe = (s: string) => [...s.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
function valorDeMana(custo: string): number {
  return simbolosDe(custo).reduce((n, s) => n + (/^\d+$/.test(s) ? Number(s) : s === 'X' ? 0 : 1), 0);
}
function coresDe(texto: string): string[] {
  const achadas = new Set(simbolosDe(texto).flatMap((s) => s.split('/')).filter((s) => ORDEM_CORES.includes(s)));
  return ORDEM_CORES.filter((c) => achadas.has(c));
}

interface Completa extends Required<Pick<CartaPropria, 'nome' | 'custo' | 'tipo' | 'tipoPt' | 'oracle' | 'texto'>> {
  ficha: boolean; layout: string; forca: string | null; resistencia: string | null; lealdade: string | null; palavras: string[]; cores: string[];
  identidade: string[]; frase: string; skinDe: string | null;
}

/** junta o que a fonte diz com os dados da carta copiada (skinDe) */
function completar(c: CartaPropria, gerado: CartasGeradas, imagens: ImagensGeradas): Completa {
  const txt = (v: number | string | null | undefined) => (v === undefined || v === null ? null : String(v));
  if (!c.skinDe) {
    if (!c.tipo || !c.tipoPt) throw new Error(`${c.nome}: faltam "tipo" e "tipoPt"`);
    const custo = c.custo ?? '';
    return {
      nome: c.nome, custo, tipo: c.tipo, tipoPt: c.tipoPt, oracle: c.oracle ?? '', texto: c.texto ?? '', ficha: !!c.ficha, layout: c.ficha ? 'token' : c.layout ?? 'normal',
      forca: txt(c.forca), resistencia: txt(c.resistencia), lealdade: null, palavras: c.palavras ?? [],
      cores: c.cores ?? coresDe(custo), identidade: c.ficha ? (c.cores ?? []) : coresDe(`${custo} ${c.oracle ?? ''}`), frase: c.frase ?? '', skinDe: null,
    };
  }
  const o = gerado.cartas[c.skinDe];
  if (!o) throw new Error(`${c.nome}: a carta "${c.skinDe}" (skinDe) não está em gerado/cartas.json`);
  if (o.faces.length !== 1) throw new Error(`${c.nome}: "${c.skinDe}" tem mais de uma face; skin só de carta de uma face`);
  const f = o.faces[0];
  const pt = imagens[c.skinDe]?.pt;
  const texto = c.texto ?? pt?.texto;
  const tipoPt = c.tipoPt ?? pt?.tipo;
  if (texto === undefined || texto === null || !tipoPt) throw new Error(`${c.nome}: "${c.skinDe}" não tem impressão em português; escreva "texto" e "tipoPt" na fonte`);
  return {
    nome: c.nome, custo: f.manaCost, tipo: f.typeLine, tipoPt, oracle: f.oracleText.replaceAll(c.skinDe, c.nome), texto, ficha: false, layout: o.layout,
    forca: txt(f.power), resistencia: txt(f.toughness), lealdade: txt(f.loyalty), palavras: o.keywords,
    cores: f.colorIndicator ?? coresDe(f.manaCost), identidade: o.colorIdentity, frase: c.frase ?? '', skinDe: c.skinDe,
  };
}

function lerGerado(): { cartas: CartasGeradas; imagens: ImagensGeradas } {
  const ler = (n: string) => JSON.parse(readFileSync(join(RAIZ_JOGO, 'gerado', n), 'utf8'));
  return { cartas: ler('cartas.json'), imagens: ler('imagens.json') };
}

function todas(): { colecao: string; cartas: Completa[] } {
  const fonte = lerProprias();
  const g = lerGerado();
  const nomes = new Set<string>();
  for (const c of fonte.cartas) {
    if (nomes.has(c.nome)) throw new Error(`${c.nome}: nome repetido em proprias/cartas.json`);
    nomes.add(c.nome);
  }
  return { colecao: fonte.colecao, cartas: fonte.cartas.map((c) => completar(c, g.cartas, g.imagens)) };
}

// ---------------------------------------------------------------------------- dados

function gravarDados(): void {
  const { colecao, cartas } = todas();
  const arq = join(RAIZ_JOGO, 'decks', 'cartas.json');
  const novas = JSON.parse(readFileSync(arq, 'utf8')) as NovasCartas;
  cartas.forEach((c, i) => {
    const oid = idDe('carta', c.nome);
    const pid = idDe('impressao', c.nome);
    const card: ScryCard = {
      id: oid, oracle_id: oid, name: c.nome, layout: c.layout, cmc: valorDeMana(c.custo), mana_cost: c.custo,
      type_line: c.tipo, oracle_text: c.oracle, power: c.forca, toughness: c.resistencia, loyalty: c.lealdade,
      colors: c.cores, color_identity: c.identidade, keywords: c.palavras, legalities: { commander: 'legal' },
      card_faces: null, all_parts: null, printing_ids: [pid],
    };
    const printing: Printing = {
      id: pid, oracle_id: oid, name: c.nome, lang: 'pt', layout: card.layout, set: colecao, collector_number: String(i + 1),
      type_line: c.tipo, oracle_text: c.oracle, power: c.forca, toughness: c.resistencia, colors: c.cores,
      printed_name: c.nome, printed_type_line: c.tipoPt, printed_text: c.texto, card_faces: null, image_status: 'highres_scan',
      local_images: [{ face: 'front', path: `imagens/${pid}/front.png` }],
    };
    novas.cards[oid] = card;
    novas.printings[pid] = printing;
    if (c.ficha) { if (!novas.fichas.includes(oid)) novas.fichas.push(oid); } else novas.escolhas[c.nome] = { en: pid, pt: pid };
  });
  writeFileSync(arq + '.novo', JSON.stringify(novas, null, 1) + '\n');
  renameSync(arq + '.novo', arq);
  console.log(`${cartas.length} cartas próprias em decks/cartas.json (${cartas.filter((c) => c.skinDe).length} skins, ${cartas.filter((c) => c.ficha).length} fichas).`);
}

// ---------------------------------------------------------------------------- imagens

const simbolos = new Map<string, string>();
function simbolo(s: string): string {
  if (!simbolos.size) {
    for (const f of readdirSync(PASTA_SIMBOLOS)) {
      const m = f.match(/^(.+?)--[0-9a-f]+\.svg$/);
      if (m && !simbolos.has(m[1])) simbolos.set(m[1], `data:image/svg+xml;base64,${readFileSync(join(PASTA_SIMBOLOS, f)).toString('base64')}`);
    }
  }
  const dado = simbolos.get(s.replaceAll('/', '-'));
  return dado ? `<img class="s" src="${dado}" alt="{${s}}">` : `{${s}}`;
}
const escapar = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const comSimbolos = (t: string) => escapar(t).replace(/\{([^}]+)\}/g, (_, s: string) => simbolo(s));

/** cores da moldura: [fundo claro, fundo escuro, borda] */
const MOLDURAS: Record<string, [string, string, string]> = {
  W: ['#f6f0dc', '#d9cfae', '#b9ad85'],
  U: ['#bcd9ee', '#5c96c4', '#2f6f9f'],
  B: ['#b9b2b0', '#4a4244', '#2a2526'],
  R: ['#f0b9a0', '#c9543a', '#9a3320'],
  G: ['#bfdcc0', '#4f8f5c', '#2c6a3a'],
  ouro: ['#f2e2a4', '#c9a646', '#96782a'],
  incolor: ['#dfe3e6', '#a9b0b6', '#7c848b'],
};

function html(c: Completa, arte: string | null): string {
  const chave = c.cores.length === 0 ? 'incolor' : c.cores.length === 1 ? c.cores[0] : 'ouro';
  const [claro, escuro, borda] = MOLDURAS[chave];
  // carta de duas cores: a moldura mistura as duas; três ou mais: ouro
  const fundo = c.cores.length === 2
    ? `linear-gradient(90deg, ${MOLDURAS[c.cores[0]][1]} 0%, ${MOLDURAS[c.cores[0]][1]} 35%, ${MOLDURAS[c.cores[1]][1]} 65%, ${MOLDURAS[c.cores[1]][1]} 100%)`
    : `linear-gradient(160deg, ${escuro}, ${borda})`;
  const regras = c.texto.split('\n').filter(Boolean).map((p) => `<p>${comSimbolos(p).replace(/\(([^)]*)\)/g, '<i>($1)</i>')}</p>`).join('');
  const tamanho = c.texto.length + c.frase.length;
  const corpo = tamanho > 480 ? 19.5 : tamanho > 400 ? 21 : tamanho > 290 ? 23 : tamanho > 200 ? 25.5 : 29;
  const pt = c.forca !== null ? `<div class="pt">${escapar(c.forca)}/${escapar(c.resistencia ?? '')}</div>` : c.lealdade !== null ? `<div class="pt">${escapar(c.lealdade)}</div>` : '';
  const iniciais = c.nome.split(/[\s,]+/).filter((p) => /^\p{Lu}/u.test(p)).slice(0, 2).map((p) => p[0]).join('');
  const quadro = arte
    ? `<img class="arte" src="${arte}">`
    : `<div class="arte provisoria"><span>${escapar(iniciais)}</span><small>arte a caminho</small></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:744px;height:1040px;background:transparent}
body{font-family:Georgia,'Times New Roman',serif;color:#16120e}
.carta{position:absolute;inset:0;border-radius:36px;background:#15120f;padding:26px 26px 0}
.dentro{position:relative;height:960px;border-radius:14px 14px 30px 30px;background:${fundo};padding:12px 14px}
.faixa{display:flex;align-items:center;justify-content:space-between;height:58px;padding:0 16px;border-radius:12px;
  background:linear-gradient(180deg,#fffdf4,${claro});border:3px solid ${borda};box-shadow:0 2px 0 rgba(0,0,0,.35)}
.nome{font-weight:700;font-size:${c.nome.length > 34 ? 25 : c.nome.length > 27 ? 28.5 : 32}px;letter-spacing:-.3px;white-space:nowrap;overflow:hidden}
.custo{display:flex;gap:3px;flex:none;margin-left:10px}
.custo .s{width:33px;height:33px;border-radius:50%;box-shadow:-1px 2px 0 rgba(0,0,0,.55)}
.quadro{margin:8px 12px 8px;height:452px;border:4px solid ${borda};background:#222;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.6)}
.arte{width:100%;height:100%;object-fit:cover;display:block}
.provisoria{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
  background:repeating-linear-gradient(135deg,${escuro} 0 26px,${borda} 26px 52px);color:rgba(255,255,255,.92)}
.provisoria span{font-size:170px;font-weight:700;text-shadow:0 5px 0 rgba(0,0,0,.4)}
.provisoria small{font-size:22px;font-style:italic;letter-spacing:1px}
.tipo{font-weight:700;font-size:${c.tipoPt.length > 40 ? 23 : 26.5}px;white-space:nowrap;overflow:hidden}
.texto{margin:8px 12px 0;height:330px;padding:14px 18px;border:3px solid ${borda};background:linear-gradient(180deg,#fdfaf0,${claro});
  font-size:${corpo}px;line-height:1.2;display:flex;flex-direction:column;justify-content:center;gap:${Math.round(corpo * 0.38)}px}
.texto .s{width:.86em;height:.86em;vertical-align:-.08em;margin:0 1px}
.frase{font-style:italic;border-top:1px solid rgba(0,0,0,.28);padding-top:${Math.round(corpo * 0.36)}px}
.pt{position:absolute;right:8px;bottom:-16px;min-width:112px;height:58px;padding:0 16px;border-radius:14px;display:flex;align-items:center;
  justify-content:center;font-weight:700;font-size:35px;background:linear-gradient(180deg,#fffdf4,${claro});border:3px solid ${borda};box-shadow:0 3px 0 rgba(0,0,0,.45)}
.rodape{position:absolute;left:44px;right:44px;bottom:15px;display:flex;justify-content:space-between;font:600 15px Arial,sans-serif;color:#d8d2c6;letter-spacing:.4px}
</style></head><body><div class="carta"><div class="dentro">
<div class="faixa"><div class="nome">${escapar(c.nome)}</div><div class="custo">${simbolosDe(c.custo).map(simbolo).join('')}</div></div>
<div class="quadro">${quadro}</div>
<div class="faixa"><div class="tipo">${escapar(c.tipoPt)}</div></div>
<div class="texto">${regras}${c.frase ? `<p class="frase">${escapar(c.frase)}</p>` : ''}</div>
${pt}</div>
<div class="rodape"><span>BRZ • PT • Sátira</span><span>Carta de brincadeira da mesa, não é oficial</span></div>
</div></body></html>`;
}

/** arte da carta: ../artes-brasil/<slug>.(png|webp|jpg), como data URI */
function arteDe(nome: string): string | null {
  for (const [ext, tipo] of [['png', 'image/png'], ['webp', 'image/webp'], ['jpg', 'image/jpeg']] as const) {
    const arq = join(PASTA_ARTES, `${slug(nome)}.${ext}`);
    if (existsSync(arq)) return `data:${tipo};base64,${readFileSync(arq).toString('base64')}`;
  }
  return null;
}

async function gravarImagens(so: string[]): Promise<void> {
  const { cartas } = todas();
  const escolhidas = so.length ? cartas.filter((c) => so.includes(c.nome)) : cartas;
  for (const n of so) if (!cartas.some((c) => c.nome === n)) throw new Error(`${n}: não está em proprias/cartas.json`);
  const { chromium } = await import('playwright');
  const navegador = await chromium.launch();
  try {
    const pagina = await navegador.newPage({ viewport: { width: 744, height: 1040 }, deviceScaleFactor: 1 });
    const tmp = join(RAIZ_JOGO, '.cache', 'cartas-proprias');
    mkdirSync(tmp, { recursive: true });
    let semArte = 0;
    for (const c of escolhidas) {
      const arte = arteDe(c.nome);
      if (!arte) semArte++;
      const arqHtml = join(tmp, `${slug(c.nome)}.html`);
      writeFileSync(arqHtml, html(c, arte));
      await pagina.goto(pathToFileURL(arqHtml).href);
      const destino = join(PASTA_IMAGENS, idDe('impressao', c.nome), 'front.png');
      mkdirSync(dirname(destino), { recursive: true });
      await pagina.screenshot({ path: destino, omitBackground: true });
    }
    console.log(`${escolhidas.length} imagens em proprias/imagens${semArte ? ` (${semArte} com arte provisória)` : ''}.`);
  } finally {
    await navegador.close();
  }
}

// só quando chamado pela linha de comando (os testes importam as funções)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [comando, ...resto] = process.argv.slice(2);
  try {
    if (!comando || comando === 'dados') gravarDados();
    if (!comando || comando === 'imagens') await gravarImagens(resto);
    if (comando && comando !== 'dados' && comando !== 'imagens') console.log('Uso: node ferramentas/cartas-proprias.ts [dados | imagens [nome...]]');
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  }
}
