// Fase 9, item 2.5: fundo da área do jogador com a arte do comandante em alta qualidade.
// O servidor usa a arte guardada em gerado/artes (baixada por ferramentas/baixar-artes.ts) e, sem ela,
// o recorte da imagem local; o fundo sai ampliado para 2560 px. Pastas temporárias com imagens
// geradas aqui, para não depender de ../cartas.
import { mkdirSync, mkdtempSync, readFileSync, rmSync, existsSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterAll, describe, expect, it } from 'vitest';
import decksJson from '../gerado/decks.json' with { type: 'json' };
import imagensJson from '../gerado/imagens.json' with { type: 'json' };
import { Imagens } from '../servidor/imagens.ts';

const TMP = mkdtempSync(join(tmpdir(), 'fase9-artes-'));
afterAll(() => rmSync(TMP, { recursive: true, force: true }));
// sem o cache de arquivos do libvips (no Windows ele deixa o arquivo aberto e não dá para regravar)
sharp.cache(false);

const COM_ARTE = '11111111-2222-3333-4444-555555555555';
const SEM_ARTE = '66666666-7777-8888-9999-aaaaaaaaaaaa';

/** pastas novas para cada teste: cartas (com uma carta sem arte guardada), artes (uma) e cache */
async function preparar() {
  const raiz = mkdtempSync(join(TMP, 'caso-'));
  const cartas = join(raiz, 'cartas');
  const artes = join(raiz, 'artes');
  const cache = join(raiz, 'cache');
  mkdirSync(join(cartas, 'assets', 'cards', SEM_ARTE), { recursive: true });
  mkdirSync(artes, { recursive: true });
  // uma "carta" 745×1040 e uma arte 744×442 (o tamanho das guardadas)
  await sharp({ create: { width: 745, height: 1040, channels: 3, background: '#335577' } }).png().toFile(join(cartas, 'assets', 'cards', SEM_ARTE, 'front.png'));
  await sharp({ create: { width: 744, height: 442, channels: 3, background: '#775533' } }).webp({ lossless: true }).toFile(join(artes, `${COM_ARTE}.webp`));
  return { img: new Imagens(cartas, cache, artes), artes };
}

describe('arte do comandante para o fundo da área', () => {
  it('com a arte em alta guardada: fundo de 2560 px e miniatura de 1000 px, tirados dela', async () => {
    const { img } = await preparar();
    const fundo = await img.arte(COM_ARTE, 'fundo');
    expect(fundo).toMatch(/-fundo-alta\.webp$/);
    const m = await sharp(fundo!).metadata();
    expect(m.width).toBe(2560);
    expect(m.height).toBe(Math.round(442 * 2560 / 744));
    const mini = await img.arte(COM_ARTE, 'arte');
    expect((await sharp(mini!).metadata()).width).toBe(1000);
    // a segunda vez vem do que ficou guardado
    expect(await img.arte(COM_ARTE, 'fundo')).toBe(fundo);
  });

  it('sem a arte em alta: recorte da imagem local, também ampliado', async () => {
    const { img } = await preparar();
    const fundo = await img.arte(SEM_ARTE, 'fundo');
    expect(fundo).toMatch(/-fundo\.webp$/);
    const m = await sharp(fundo!).metadata();
    expect(m.width).toBe(2560);
    // a caixa antiga: 84% × 35% da carta
    expect(m.height).toBe(Math.round(Math.round(1040 * 0.35) * 2560 / Math.round(745 * 0.84)));
  });

  it('id inválido ou sem imagem nenhuma: nada', async () => {
    const { img } = await preparar();
    expect(await img.arte('../../segredo', 'fundo')).toBeNull();
    expect(await img.arte('00000000-0000-0000-0000-000000000000', 'fundo')).toBeNull();
  });

  it('arte baixada de novo (arquivo mais novo) refaz o fundo guardado', async () => {
    const { img, artes } = await preparar();
    const fundo = (await img.arte(COM_ARTE, 'fundo'))!;
    const antes = readFileSync(fundo);
    const arte = join(artes, `${COM_ARTE}.webp`);
    await sharp({ create: { width: 700, height: 500, channels: 3, background: '#224466' } }).webp({ lossless: true }).toFile(arte);
    const futuro = new Date(Date.now() + 60_000);
    utimesSync(arte, futuro, futuro);
    const depois = (await img.arte(COM_ARTE, 'fundo'))!;
    expect((await sharp(depois).metadata()).height).toBe(Math.round(500 * 2560 / 700));
    expect(readFileSync(depois).equals(antes)).toBe(false);
  });
});

describe('artes guardadas no repositório (gerado/artes)', () => {
  const pasta = join(import.meta.dirname, '..', 'gerado', 'artes');
  const fontes = JSON.parse(readFileSync(join(pasta, 'fontes.json'), 'utf8')) as Record<string, { imagemLocal: string; tamanho: [number, number]; impressao: { url: string } }>;
  type Img = { id: string; reserva?: boolean } | null;
  const IMG = imagensJson as unknown as Record<string, { en: Img; pt: Img }>;

  it('cada comandante dos decks tem a arte, com a origem registrada e mais larga que o recorte antigo (626 px)', async () => {
    for (const d of decksJson as { comandante: string }[]) {
      const i = IMG[d.comandante];
      // a mesma regra de servidor/cartas-info.ts para a imagem que o cliente pede
      const id = (i?.pt && !i.pt.reserva ? i.pt : i?.en)!.id;
      const f = fontes[d.comandante];
      expect(f, d.comandante).toBeDefined();
      expect(f.imagemLocal).toBe(id);
      expect(f.impressao.url).toMatch(/^https:\/\/cards\.scryfall\.io\//);
      const arquivo = join(pasta, `${id}.webp`);
      expect(existsSync(arquivo), d.comandante).toBe(true);
      const m = await sharp(arquivo).metadata();
      expect([m.width, m.height]).toEqual(f.tamanho);
      expect(m.width).toBeGreaterThan(700);
    }
  });
});
