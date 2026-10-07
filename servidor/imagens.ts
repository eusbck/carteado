// Imagens das cartas: lidas da pasta original (cartas/assets, somente leitura) e servidas
// só para sessões autenticadas. As miniaturas WebP são geradas sob demanda e guardadas em
// .cache/miniaturas (fora do repositório). A arte dos comandantes em alta qualidade vem de
// gerado/artes (baixada uma vez por ferramentas/baixar-artes.ts).

import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const LARGURAS = { p: 250, m: 520 } as const;
export type Tamanho = keyof typeof LARGURAS | 'g';

export class Imagens {
  private simbolos = new Map<string, string>();
  private gerando = new Map<string, Promise<string | null>>();

  private pastaCartas: string;
  private cache: string;
  private pastaArtes: string;

  constructor(pastaCartas: string, cache: string, pastaArtes = join(dirname(fileURLToPath(import.meta.url)), '..', 'gerado', 'artes')) {
    this.pastaCartas = pastaCartas;
    this.cache = cache;
    this.pastaArtes = pastaArtes;
    mkdirSync(cache, { recursive: true });
    const pastaSimbolos = join(pastaCartas, 'assets', 'symbols');
    if (existsSync(pastaSimbolos)) {
      for (const f of readdirSync(pastaSimbolos)) {
        const m = f.match(/^(.+?)--[0-9a-f]+\.svg$/);
        if (m && !this.simbolos.has(m[1])) this.simbolos.set(m[1], join(pastaSimbolos, f));
      }
    }
  }

  /** caminho do arquivo pronto para servir, ou null se não existir */
  async carta(id: string, lado: 'frente' | 'verso', tam: Tamanho): Promise<string | null> {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) return null;
    const original = join(this.pastaCartas, 'assets', 'cards', id, lado === 'frente' ? 'front.png' : 'back.png');
    if (!existsSync(original)) return null;
    if (tam === 'g') return original;
    const destino = join(this.cache, `${id}-${lado}-${tam}.webp`);
    if (existsSync(destino)) return destino;
    const chave = destino;
    let p = this.gerando.get(chave);
    if (!p) {
      p = sharp(original).resize({ width: LARGURAS[tam] }).webp({ quality: 82 }).toFile(destino).then(() => destino, (e) => { console.error('miniatura:', e); return null; });
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
   * Nenhuma fonte passa de 745 px de largura: o fundo é ampliado aqui com lanczos3 e uma nitidez
   * leve, que fica bem mais limpo que deixar o navegador esticar a imagem pequena.
   */
  async arte(id: string, uso: 'arte' | 'fundo' = 'arte'): Promise<string | null> {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) return null;
    const alta = join(this.pastaArtes, `${id}.webp`);
    const original = existsSync(alta) ? alta : join(this.pastaCartas, 'assets', 'cards', id, 'front.png');
    if (!existsSync(original)) return null;
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
        if (uso === 'fundo') await img.resize({ width: 2560, kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).webp({ quality: 86 }).toFile(destino);
        else await img.resize({ width: 1000 }).webp({ quality: 80 }).toFile(destino);
        return destino;
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
