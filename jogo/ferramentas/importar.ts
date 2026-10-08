// Regera jogo/gerado/ a partir de ../cartas (somente leitura) e de decks/. O mesmo que `node ferramentas/decks.ts gerar`.
// Uso: node ferramentas/importar.ts

import { pastasPadrao } from '../servidor/catalogo/caminhos.ts';
import { Catalogo } from '../servidor/catalogo/catalogo.ts';
import { regenerar } from '../servidor/catalogo/gerar.ts';

const pastas = pastasPadrao();
const s = regenerar(pastas, new Catalogo({ pasta: pastas.decks, pronta: () => true }).todos());
for (const a of s.avisos) console.log(`aviso: ${a}`);
console.log(`cartas: ${Object.keys(s.cartas.cartas).length}, fichas/auxiliares: ${s.cartas.fichas.length}, decks: ${s.decks.length}`);
