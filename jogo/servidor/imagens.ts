// Imagens das cartas: lidas da pasta original (cartas/assets, somente leitura) e servidas
// só para sessões autenticadas. As miniaturas WebP são geradas sob demanda e guardadas em
// .cache/miniaturas (fora do repositório). A arte dos comandantes em alta qualidade vem de
// gerado/artes (baixada uma vez por ferramentas/baixar-artes.ts); o fundo da mesa de cada deck, quando houver um
// feito para ele, vem de gerado/fundos. As cartas de decks importados pela tela Decks têm as imagens em pastas
// extras (dados-locais/imagens/<id>/front.png).

import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { rename, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

/** largura de cada tamanho: p (mão, mesa), m (mesa grande), g (zoom: a largura original, só convertida para WebP) */
const LARGURAS = { p: 250, m: 520, g: null } as const;
export type Tamanho = keyof typeof LARGURAS;

/**
 * Grava a imagem num arquivo temporário e só depois a põe no lugar (rename). Gravando direto no destino, um pedido
 * simultâneo via o arquivo pela metade (existsSync já dava verdadeiro) e o navegador o guardava por 7 dias.
 */
async function gravar(destino: string, img: ReturnType<typeof sharp>): Promise<string> {
  const tmp = `${destino}.${process.pid}-${randomBytes(4).toString('hex')}.tmp`;
  try {
    await img.toFile(tmp);
    await rename(tmp, destino);
  } catch (e) {
    await rm(tmp, { force: true });
    // outro processo pôs o arquivo no lugar ao mesmo tempo (Windows recusa trocar um arquivo aberto): vale o dele
    if (existsSync(destino)) return destino;
    throw e;
  }
  return destino;
}

export class Imagens {
  private simbolos = new Map<string, string>();
  private gerando = new Map<string, Promise<string | null>>();

  private pastaCartas: string;
  private cache: string;
  private pastaArtes: string;
  private pastasExtras: string[];
  private pastaFundos: string;

  constructor(pastaCartas: string, cache: string, pastaArtes = join(dirname(fileURLToPath(import.meta.url)), '..', 'gerado', 'artes'), pastasExtras: string[] = [],
    pastaFundos = join(dirname(fileURLToPath(import.meta.url)), '..', 'gerado', 'fundos')) {
    this.pastaCartas = pastaCartas;
    this.cache = cache;
    this.pastaArtes = pastaArtes;
    this.pastasExtras = pastasExtras;
    this.pastaFundos = pastaFundos;
    mkdirSync(cache, { recursive: true });
    const pastaSimbolos = join(pastaCartas, 'assets', 'symbols');
    if (existsSync(pastaSimbolos)) {
      for (const f of readdirSync(pastaSimbolos)) {
        const m = f.match(/^(.+?)--[0-9a-f]+\.svg$/);
        if (m && !this.simbolos.has(m[1])) this.simbolos.set(m[1], join(pastaSimbolos, f));
      }
    }
  }

  /** imagem original da carta: em ../cartas/assets/cards ou numa pasta extra */
  private original(id: string, arquivo: string): string | null {
    for (const p of [join(this.pastaCartas, 'assets', 'cards', id, arquivo), ...this.pastasExtras.map((x) => join(x, id, arquivo))]) {
      if (existsSync(p)) return p;
    }
    return null;
  }

  /** caminho do arquivo pronto para servir, ou null se não existir */
  async carta(id: string, lado: 'frente' | 'verso', tam: Tamanho): Promise<string | null> {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) return null;
    const original = this.original(id, lado === 'frente' ? 'front.png' : 'back.png');
    if (!original) return null;
    const destino = join(this.cache, `${id}-${lado}-${tam}.webp`);
    if (existsSync(destino)) return destino;
    const chave = destino;
    let p = this.gerando.get(chave);
    if (!p) {
      // o zoom (g) era o PNG original (perto de 1 MB por carta); em WebP de alta qualidade fica uma fração disso
      const largura = LARGURAS[tam];
      const img = largura ? sharp(original).resize({ width: largura }).webp({ quality: 82 }) : sharp(original).webp({ quality: 90 });
      p = gravar(destino, img).catch((e) => { console.error('miniatura:', e); return null; });
      this.gerando.set(chave, p);
      void p.finally(() => this.gerando.delete(chave));
    }
    return p;
  }

  /**
   * Arte da carta: `arte` (1000 px, miniatura dos decks no saguão) ou `fundo` (2560 px, fundo da
   * área do jogador). A fonte é a arte em alta qualidade guardada por ferramentas/baixar-artes.ts
   * (gerado/artes, os comandantes); sem ela, um recorte da imagem local da frente, cuja caixa cobre
   * a arte das molduras comuns sem pegar o nome nem a linha de tipo.
   * Nenhuma dessas fontes passa de 745 px de largura: o fundo é ampliado aqui com lanczos3 e uma nitidez
   * leve, que fica bem mais limpo que deixar o navegador esticar a imagem pequena.
   * O fundo feito para o deck (gerado/fundos/<id da imagem do comandante>.webp, em alta) vale antes de tudo e
   * sai como está, sem ampliar; a miniatura do saguão continua sendo a arte da carta.
   */
  async arte(id: string, uso: 'arte' | 'fundo' = 'arte'): Promise<string | null> {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) return null;
    if (uso === 'fundo') {
      const proprio = join(this.pastaFundos, `${id}.webp`);
      if (existsSync(proprio)) return proprio;
    }
    const alta = join(this.pastaArtes, `${id}.webp`);
    const original = existsSync(alta) ? alta : this.original(id, 'front.png');
    if (!original) return null;
    // o nome muda com a fonte; um arquivo novo em gerado/artes refaz o que estava guardado
    const destino = join(this.cache, `${id}-${uso}${original === alta ? '-alta' : ''}.webp`);
    if (existsSync(destino) && statSync(destino).mtimeMs >= statSync(original).mtimeMs) return destino;
    let p = this.gerando.get(destino);
    if (!p) {
      p = (async () => {
        let img = sharp(original);
        if (original !== alta) {
          const { width: w = 745, height: h = 1040 } = await img.metadata();
          img = img.extract({ left: Math.round(w * .08), top: Math.round(h * .12), width: Math.round(w * .84), height: Math.round(h * .35) });
        }
        if (uso === 'fundo') return gravar(destino, img.resize({ width: 2560, kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).webp({ quality: 86 }));
        return gravar(destino, img.resize({ width: 1000 }).webp({ quality: 80 }));
      })().catch((e) => { console.error('arte:', e); return null; });
      this.gerando.set(destino, p);
      void p.finally(() => this.gerando.delete(destino));
    }
    return p;
  }

  /** símbolo de mana pelo código ("W", "U-R", "2-B", "T"…) */
  simbolo(codigo: string): string | null {
    return this.simbolos.get(codigo) ?? null;
  }
}
