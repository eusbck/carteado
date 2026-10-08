// Pastas do catálogo de decks. Os testes trocam qualquer uma por uma pasta temporária.

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ_JOGO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export interface Pastas {
  /** jogo/decks: um arquivo por deck, mais cartas.json e rulings.json das cartas novas */
  decks: string;
  /** ../cartas (somente leitura): dados e imagens dos 7 decks coletados */
  cartasOriginais: string;
  /** imagens das cartas novas (fora do repositório): <id>/front.png e back.png. Não depende de DADOS (o banco):
   * servidores de teste com outro banco continuam achando as imagens das cartas importadas. */
  imagens: string;
  /** jogo/gerado: o que o motor e o servidor leem */
  gerado: string;
  /** jogo/gerado/artes: arte dos comandantes em alta qualidade */
  artes: string;
  /** ../dados (somente leitura): lista de banidas */
  dados: string;
}

export function pastasPadrao(o: Partial<Pastas> = {}): Pastas {
  const gerado = o.gerado ?? join(RAIZ_JOGO, 'gerado');
  return {
    decks: o.decks ?? join(RAIZ_JOGO, 'decks'),
    cartasOriginais: o.cartasOriginais ?? join(RAIZ_JOGO, '..', 'cartas'),
    imagens: o.imagens ?? process.env.IMAGENS ?? join(RAIZ_JOGO, 'dados-locais', 'imagens'),
    gerado,
    artes: o.artes ?? join(gerado, 'artes'),
    dados: o.dados ?? join(RAIZ_JOGO, '..', 'dados'),
  };
}
