// Retratos menores para a mesa: cliente/src/imagens/avatares/mesa/<id>.webp, com 256 px, feitos dos de 512 (que ficam
// para a janela de escolha do retrato). Na mesa o retrato é desenhado com 118% do diâmetro da moldura, que vai até
// 100 px (mesa/AreaJogador.tsx): 118 px na tela, ou 236 px de imagem numa tela de densidade 2. Os 256 px cobrem isso
// sem perder nitidez; telas de densidade maior pegam o de 512 pelo srcset (mesa/Avatar.tsx).
//
// Para a mesa ficar com os mesmos pixels de antes, o de 256 é a média exata de cada 2×2 pixels do de 512 (com o alfa
// pré-multiplicado): é o primeiro nível do mipmap que o navegador monta para reduzir a imagem de 512, então ele chega
// aos mesmos tons partindo de um ou do outro. A gravação é WebP quase sem perda (nearLossless 60): o WebP com perda
// guarda a cor em meia resolução (4:2:0) e mudava até 30 tons nos detalhes; assim a diferença na tela fica em 4 tons no
// máximo (conferido por comparação de pixels da mesa), com 42% menos bytes que os de 512.
// Uso: node ferramentas/avatares-mesa.ts   (refaz todos: rode de novo ao trocar ou incluir um retrato)

import { mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { AVATARES } from '../servidor/avatares.ts';

const PASTA = join(dirname(fileURLToPath(import.meta.url)), '..', 'cliente', 'src', 'imagens', 'avatares');

/** metade da largura e da altura: a média de cada bloco 2×2, com as cores pesadas pelo alfa */
async function metade(origem: string): Promise<{ dados: Buffer; lado: number }> {
  const { data, info } = await sharp(origem).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== info.height || info.width % 2) throw new Error(`${origem}: o retrato precisa ser quadrado, de lado par`);
  const lado = info.width / 2;
  const dados = Buffer.alloc(lado * lado * 4);
  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const k = ((2 * y + dy) * info.width + 2 * x + dx) * 4;
          const al = data[k + 3];
          r += data[k] * al; g += data[k + 1] * al; b += data[k + 2] * al; a += al;
        }
      }
      const k = (y * lado + x) * 4;
      dados[k + 3] = Math.round(a / 4);
      if (a) { dados[k] = Math.round(r / a); dados[k + 1] = Math.round(g / a); dados[k + 2] = Math.round(b / a); }
    }
  }
  return { dados, lado };
}

mkdirSync(join(PASTA, 'mesa'), { recursive: true });
let antes = 0, depois = 0;
for (const a of AVATARES) {
  const origem = join(PASTA, `${a.id}.webp`);
  const destino = join(PASTA, 'mesa', `${a.id}.webp`);
  const { dados, lado } = await metade(origem);
  await sharp(dados, { raw: { width: lado, height: lado, channels: 4 } }).webp({ nearLossless: true, quality: 60, effort: 6 }).toFile(destino);
  antes += statSync(origem).size;
  depois += statSync(destino).size;
  console.log(`${a.id}: ${statSync(origem).size} → ${statSync(destino).size} bytes (${lado} px)`);
}
console.log(`total: ${antes} → ${depois} bytes`);
