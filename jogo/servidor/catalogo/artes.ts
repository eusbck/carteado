// Arte dos comandantes em alta qualidade, para o fundo da área de cada jogador (fase 9).
//
// A imagem local de cada carta é a "png" da Scryfall (745×1040), e o recorte da arte feito dela tem só 626×364.
// Nenhuma fonte pública tem a arte maior que a largura da carta (o "art_crop" tem 626×457 nas molduras comuns e no
// máximo 745 de largura), então, entre as impressões do comandante com a MESMA ilustração, fica a que mostra a arte
// na largura toda da carta (sem borda ou com arte estendida): a faixa entre a barra do nome e a linha de tipo é
// guardada sem perdas em gerado/artes/<id da imagem local>.webp. Sem impressão assim, guarda o art_crop. O servidor
// amplia e dá nitidez na hora de servir (servidor/imagens.ts).

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import type { Rede } from './rede.ts';

interface Impressao {
  id: string; set: string; collector_number: string; lang: string; illustration_id?: string; artist?: string;
  border_color: string; frame: string; frame_effects?: string[]; full_art: boolean; highres_image: boolean;
  type_line: string; image_uris?: { png: string; art_crop: string }; prints_search_uri: string;
}
interface Lista { data: Impressao[]; has_more: boolean; next_page?: string }

export interface RegistroArte {
  imagemLocal: string;
  impressao: { id: string; colecao: string; numero: string; moldura: string; artista: string | null; url: string };
  recorte: { x: number; y: number; largura: number; altura: number } | 'art_crop';
  tamanho: [number, number];
  candidatas: string[];
  baixadoEm: string;
}

/** a arte ocupa a largura toda da carta (sem borda, arte estendida ou arte cheia) */
const larguraToda = (p: Impressao) => p.border_color === 'borderless' || !!p.frame_effects?.includes('extendedart') || p.full_art;

/**
 * Faixa limpa da arte (em frações da altura da png 745×1040) nas molduras de largura toda: abaixo da barra do
 * nome e acima da linha de tipo, que nos planeswalkers fica mais alta. Conferido a olho nas sete cartas dos decks.
 */
const faixa = (p: Impressao): [number, number] => (p.type_line.includes('Planeswalker') ? [0.115, 0.478] : [0.13, 0.555]);

export function lerFontes(pastaArtes: string): Record<string, RegistroArte> {
  const arq = join(pastaArtes, 'fontes.json');
  return existsSync(arq) ? JSON.parse(readFileSync(arq, 'utf8')) : {};
}

export function gravarFontes(pastaArtes: string, registros: Record<string, RegistroArte>): void {
  mkdirSync(pastaArtes, { recursive: true });
  const arq = join(pastaArtes, 'fontes.json');
  writeFileSync(arq + '.novo', JSON.stringify(registros, null, 1) + '\n');
  renameSync(arq + '.novo', arq);
}

export const arquivoArte = (pastaArtes: string, idLocal: string) => join(pastaArtes, `${idLocal}.webp`);

/** a arte do comandante já está guardada para esta imagem local */
export function temArte(pastaArtes: string, nome: string, idLocal: string, registros = lerFontes(pastaArtes)): boolean {
  return existsSync(arquivoArte(pastaArtes, idLocal)) && registros[nome]?.imagemLocal === idLocal;
}

/** baixa a arte de um comandante e grava gerado/artes/<idLocal>.webp; devolve o registro para fontes.json */
export async function baixarArte(o: { rede: Rede; nome: string; idLocal: string; pastaArtes: string }): Promise<RegistroArte> {
  const { rede } = o;
  const carta = await rede.json<Impressao>(`https://api.scryfall.com/cards/${o.idLocal}`);
  const todas: Impressao[] = [];
  for (let url: string | undefined = `${carta.prints_search_uri}&include_extras=true&include_variations=true`; url;) {
    const l: Lista = await rede.json<Lista>(url);
    todas.push(...l.data);
    url = l.has_more ? l.next_page : undefined;
  }
  // só a mesma ilustração da carta do deck (outras impressões podem ter outra arte) e com imagem de uma face
  const mesmas = todas.filter((p) => p.image_uris && (p.illustration_id === carta.illustration_id || p.id === carta.id));
  if (!mesmas.some((p) => p.id === carta.id) && carta.image_uris) mesmas.push(carta);
  if (!mesmas.length) throw new Error(`${o.nome}: nenhuma impressão com imagem no Scryfall`);
  // a arte mais larga primeiro; entre iguais, a digitalização em alta, e então a própria carta do deck
  const nota = (p: Impressao) => (larguraToda(p) ? 4 : 0) + (p.highres_image ? 2 : 0) + (p.id === carta.id ? 1 : 0);
  const escolhida = [...mesmas].sort((a, b) => nota(b) - nota(a))[0];

  let saida: ReturnType<typeof sharp>;
  let recorte: RegistroArte['recorte'];
  if (larguraToda(escolhida)) {
    const png = await rede.binario(escolhida.image_uris!.png);
    const { width: w = 745, height: h = 1040 } = await sharp(png).metadata();
    const [de, ate] = faixa(escolhida);
    recorte = { x: 0, y: Math.round(h * de), largura: w, altura: Math.round(h * (ate - de)) };
    saida = sharp(png).extract({ left: recorte.x, top: recorte.y, width: recorte.largura, height: recorte.altura });
  } else {
    recorte = 'art_crop';
    saida = sharp(await rede.binario(escolhida.image_uris!.art_crop));
  }
  mkdirSync(o.pastaArtes, { recursive: true });
  const arquivo = arquivoArte(o.pastaArtes, o.idLocal);
  const info = await saida.webp({ lossless: true, effort: 6 }).toFile(arquivo + '.novo.webp');
  renameSync(arquivo + '.novo.webp', arquivo);
  return {
    imagemLocal: o.idLocal,
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
}
