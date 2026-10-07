// Artes dos comandantes em alta qualidade, para o fundo da área de cada jogador (fase 9).
//
// A imagem local de cada carta (../cartas, 745×1040) é a "png" da Scryfall, e o recorte da arte que
// o servidor fazia dela tinha só 626×364. Nenhuma fonte pública tem a arte maior que a largura da
// carta (o "art_crop" da Scryfall tem 626×457 nas molduras comuns e no máximo 745 de largura), então
// este script escolhe, entre as impressões do comandante na Scryfall com a MESMA ilustração, a que
// mostra a arte na largura toda da carta (sem borda ou com arte estendida), recorta a faixa entre a
// barra do nome e a linha de tipo e guarda sem perdas em gerado/artes/<id da imagem local>.webp.
// Sem impressão assim, guarda o art_crop da Scryfall. O servidor amplia e dá nitidez na hora de
// servir (servidor/imagens.ts). Roda uma vez, com internet; a partida só lê os arquivos guardados.
//
// Respeita a API da Scryfall: User-Agent e Accept próprios, um pedido por vez, 120 ms entre eles.
// Uso: node ferramentas/baixar-artes.ts [--forcar]   (sem --forcar, pula o que já foi baixado)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = join(RAIZ, 'gerado', 'artes');
const FONTES = join(DESTINO, 'fontes.json');
const FORCAR = process.argv.includes('--forcar');

const CABECALHO = { 'User-Agent': 'CommanderDaMesa/0.9 (jogo privado de Commander; ferramentas/baixar-artes.ts)' };
const INTERVALO = 120;

interface Impressao {
  id: string; set: string; collector_number: string; lang: string; illustration_id?: string; artist?: string;
  border_color: string; frame: string; frame_effects?: string[]; full_art: boolean; highres_image: boolean;
  type_line: string; image_uris?: { png: string; art_crop: string }; prints_search_uri: string;
}
interface Lista { data: Impressao[]; has_more: boolean; next_page?: string }

let ultimo = 0;
async function pedir(url: string, tipo: 'json' | 'imagem'): Promise<Response> {
  const falta = ultimo + INTERVALO - Date.now();
  if (falta > 0) await new Promise((ok) => setTimeout(ok, falta));
  ultimo = Date.now();
  const r = await fetch(url, { headers: { ...CABECALHO, Accept: tipo === 'json' ? 'application/json;q=0.9,*/*;q=0.8' : 'image/png,image/jpeg;q=0.9,*/*;q=0.8' } });
  if (!r.ok) throw new Error(`${url}: ${r.status} ${r.statusText}`);
  return r;
}
const json = async <T>(url: string) => (await pedir(url, 'json')).json() as Promise<T>;
const imagem = async (url: string) => Buffer.from(await (await pedir(url, 'imagem')).arrayBuffer());

/** a arte ocupa a largura toda da carta (sem borda, arte estendida ou arte cheia) */
const larguraToda = (p: Impressao) => p.border_color === 'borderless' || !!p.frame_effects?.includes('extendedart') || p.full_art;

/**
 * Faixa limpa da arte (em frações da altura da png 745×1040) nas molduras de largura toda: abaixo da
 * barra do nome e acima da linha de tipo, que nos planeswalkers fica mais alta. Conferido a olho nas
 * sete cartas dos decks.
 */
const faixa = (p: Impressao): [number, number] => (p.type_line.includes('Planeswalker') ? [0.115, 0.478] : [0.13, 0.555]);

/** a mesma regra de servidor/cartas-info.ts: impressão em português se houver e não for reserva */
function idLocal(nome: string): string | null {
  type Img = { id: string; reserva?: boolean } | null;
  const img = JSON.parse(readFileSync(join(RAIZ, 'gerado', 'imagens.json'), 'utf8')) as Record<string, { en: Img; pt: Img }>;
  const i = img[nome];
  return ((i?.pt && !i.pt.reserva ? i.pt : i?.en) ?? null)?.id ?? null;
}

interface Registro {
  imagemLocal: string;
  impressao: { id: string; colecao: string; numero: string; moldura: string; artista: string | null; url: string };
  recorte: { x: number; y: number; largura: number; altura: number } | 'art_crop';
  tamanho: [number, number];
  candidatas: string[];
  baixadoEm: string;
}

mkdirSync(DESTINO, { recursive: true });
const registros: Record<string, Registro> = existsSync(FONTES) ? JSON.parse(readFileSync(FONTES, 'utf8')) : {};
const decks = JSON.parse(readFileSync(join(RAIZ, 'gerado', 'decks.json'), 'utf8')) as { comandante: string | string[] }[];
// parceiros e fundos (se um deck tiver mais de um comandante) entram todos
const comandantes = [...new Set(decks.flatMap((d) => (Array.isArray(d.comandante) ? d.comandante : [d.comandante])))];

for (const nome of comandantes) {
  const local = idLocal(nome);
  if (!local) { console.log(`${nome}: sem imagem local, pulado`); continue; }
  const arquivo = join(DESTINO, `${local}.webp`);
  if (!FORCAR && existsSync(arquivo) && registros[nome]?.imagemLocal === local) { console.log(`${nome}: já baixado`); continue; }

  const carta = await json<Impressao>(`https://api.scryfall.com/cards/${local}`);
  const todas: Impressao[] = [];
  for (let url: string | undefined = `${carta.prints_search_uri}&include_extras=true&include_variations=true`; url;) {
    const l: Lista = await json<Lista>(url);
    todas.push(...l.data);
    url = l.has_more ? l.next_page : undefined;
  }
  // só a mesma ilustração da carta do deck (outras impressões podem ter outra arte) e com imagem de uma face
  const mesmas = todas.filter((p) => p.image_uris && (p.illustration_id === carta.illustration_id || p.id === carta.id));
  if (!mesmas.some((p) => p.id === carta.id) && carta.image_uris) mesmas.push(carta);
  // a arte mais larga primeiro; entre iguais, a digitalização em alta, e então a própria carta do deck
  const nota = (p: Impressao) => (larguraToda(p) ? 4 : 0) + (p.highres_image ? 2 : 0) + (p.id === carta.id ? 1 : 0);
  const escolhida = [...mesmas].sort((a, b) => nota(b) - nota(a))[0];

  let saida: ReturnType<typeof sharp>;
  let recorte: Registro['recorte'];
  if (larguraToda(escolhida)) {
    const png = await imagem(escolhida.image_uris!.png);
    const { width: w = 745, height: h = 1040 } = await sharp(png).metadata();
    const [de, ate] = faixa(escolhida);
    recorte = { x: 0, y: Math.round(h * de), largura: w, altura: Math.round(h * (ate - de)) };
    saida = sharp(png).extract({ left: recorte.x, top: recorte.y, width: recorte.largura, height: recorte.altura });
  } else {
    recorte = 'art_crop';
    saida = sharp(await imagem(escolhida.image_uris!.art_crop));
  }
  const info = await saida.webp({ lossless: true, effort: 6 }).toFile(arquivo);
  registros[nome] = {
    imagemLocal: local,
    impressao: {
      id: escolhida.id, colecao: escolhida.set, numero: escolhida.collector_number,
      moldura: [escolhida.frame, escolhida.border_color, ...(escolhida.frame_effects ?? [])].join(' '),
      artista: escolhida.artist ?? null,
      url: recorte === 'art_crop' ? escolhida.image_uris!.art_crop : escolhida.image_uris!.png,
    },
    recorte,
    tamanho: [info.width, info.height],
    candidatas: mesmas.map((p) => `${p.set}/${p.collector_number} ${p.border_color}${p.frame_effects?.length ? ' ' + p.frame_effects.join('+') : ''}`),
    baixadoEm: new Date().toISOString(),
  };
  console.log(`${nome}: ${escolhida.set}/${escolhida.collector_number} (${registros[nome].impressao.moldura}) → ${info.width}×${info.height}`);
  writeFileSync(FONTES, JSON.stringify(registros, null, 1) + '\n');
}
