// Artes dos comandantes em alta qualidade, para o fundo da área de cada jogador (fase 9). A escolha da impressão e
// o recorte estão em servidor/catalogo/artes.ts (a importação de decks pela tela usa o mesmo código).
//
// Respeita a API da Scryfall: User-Agent e Accept próprios, um pedido por vez, com intervalo entre eles.
// Uso: node ferramentas/baixar-artes.ts [--forcar]   (sem --forcar, pula o que já foi baixado)

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { baixarArte, gravarFontes, lerFontes, temArte } from '../servidor/catalogo/artes.ts';
import { pastasPadrao } from '../servidor/catalogo/caminhos.ts';
import { redeReal } from '../servidor/catalogo/rede.ts';

const FORCAR = process.argv.includes('--forcar');
const pastas = pastasPadrao();

/** a mesma regra de servidor/cartas-info.ts: impressão em português se houver e não for reserva */
function idLocal(nome: string): string | null {
  type Img = { id: string; reserva?: boolean } | null;
  const img = JSON.parse(readFileSync(join(pastas.gerado, 'imagens.json'), 'utf8')) as Record<string, { en: Img; pt: Img }>;
  const i = img[nome];
  return ((i?.pt && !i.pt.reserva ? i.pt : i?.en) ?? null)?.id ?? null;
}

const rede = redeReal();
const registros = lerFontes(pastas.artes);
const decks = JSON.parse(readFileSync(join(pastas.gerado, 'decks.json'), 'utf8')) as { comandante: string | string[] }[];
// parceiros e fundos (se um deck tiver mais de um comandante) entram todos
const comandantes = [...new Set(decks.flatMap((d) => (Array.isArray(d.comandante) ? d.comandante : [d.comandante])))];

for (const nome of comandantes) {
  const local = idLocal(nome);
  if (!local) { console.log(`${nome}: sem imagem local, pulado`); continue; }
  if (!FORCAR && temArte(pastas.artes, nome, local, registros)) { console.log(`${nome}: já baixado`); continue; }
  const r = await baixarArte({ rede, nome, idLocal: local, pastaArtes: pastas.artes });
  registros[nome] = r;
  console.log(`${nome}: ${r.impressao.colecao}/${r.impressao.numero} (${r.impressao.moldura}) → ${r.tamanho[0]}×${r.tamanho[1]}`);
  gravarFontes(pastas.artes, registros);
}
