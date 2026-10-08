// As cartas de decks importados têm as imagens fora de ../cartas (dados-locais/imagens): o servidor de imagens
// procura também nessa pasta, para a carta inteira, as miniaturas e a arte recortada.
import { mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { Imagens } from '../../servidor/imagens.ts';

sharp.cache(false);
const ID = 'abcdef01-2345-4678-89ab-cdef01234567';

describe('imagens das cartas novas', () => {
  it('carta, miniatura e arte vêm da pasta extra; id de fora continua sem imagem', async () => {
    const raiz = mkdtempSync(join(tmpdir(), 'imagens-extra-'));
    const extra = join(raiz, 'imagens');
    mkdirSync(join(extra, ID), { recursive: true });
    await sharp({ create: { width: 745, height: 1040, channels: 3, background: '#335577' } }).png().toFile(join(extra, ID, 'front.png'));
    const img = new Imagens(join(raiz, 'cartas'), join(raiz, 'cache'), join(raiz, 'artes'), [extra]);
    expect(await img.carta(ID, 'frente', 'g')).toBe(join(extra, ID, 'front.png'));
    const p = await img.carta(ID, 'frente', 'p');
    expect((await sharp(p!).metadata()).width).toBe(250);
    expect(await img.carta(ID, 'verso', 'g')).toBeNull();
    const arte = await img.arte(ID, 'arte');
    expect((await sharp(arte!).metadata()).width).toBe(1000);
    expect(await img.carta('11111111-2222-4333-8444-555555555555', 'frente', 'g')).toBeNull();
  });
});
