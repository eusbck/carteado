// N30: a cada vista nova, as imagens das cartas que podem aparecer em seguida já começam a ser decodificadas
// (cliente/src/imagens.ts). Ligado uma vez, quando a primeira carta da mesa é carregada (Carta.tsx).

import { prepararVista } from '../imagens.ts';
import { loja } from '../loja.ts';

let ligado = false;

export function ligarPreparoDasImagens(): void {
  if (ligado) return;
  ligado = true;
  loja.assinar(() => prepararVista(loja.e.vista));
  prepararVista(loja.e.vista);
}
