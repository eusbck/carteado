// Imagens das cartas: lidas da pasta original (cartas/assets, somente leitura) e servidas
// só para sessões autenticadas. As miniaturas WebP são geradas sob demanda e guardadas em
// .cache/miniaturas (fora do repositório).

import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const LARGURAS = { p: 250, m: 520 } as const;
export type Tamanho = keyof typeof LARGURAS | 'g';

export class Imagens {
  private simbolos = new Map<string, string>();
  private gerando = new Map<string, Promise<string | null>>();

  private pastaCartas: string;
  private cache: string;

  constructor(pastaCartas: string, cache: string) {
    this.pastaCartas = pastaCartas;
    this.cache = cache;
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

  /** símbolo de mana pelo código ("W", "U-R", "2-B", "T"…) */
  simbolo(codigo: string): string | null {
    return this.simbolos.get(codigo) ?? null;
  }
}
