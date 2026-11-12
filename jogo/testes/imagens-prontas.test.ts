// Revisão 2 do estudo do Arena, N30: o mapa de imagens decodificadas (cliente/src/imagens.ts). A imagem de cada
// endereço é pedida e decodificada uma vez só, quem chama de novo recebe a mesma promessa, a falha não prende ninguém
// nem fica no mapa, e a cada vista são preparadas as cartas que podem aparecer em seguida.
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { GameView, ObjView } from '../motor/view.ts';

vi.mock('../cliente/src/loja.ts', () => ({ loja: { e: { vista: null }, assinar: () => () => {} } }));

const { carregarCartas } = await import('../cliente/src/cartas.ts');
const { imagemPronta, prepararImagem, urlsDaVista, zerarImagens } = await import('../cliente/src/imagens.ts');

/** Image de mentira: decode resolve, ou rejeita para endereços com "quebrada" */
class ImagemFalsa {
  static criadas = 0;
  decoding = '';
  src = '';
  constructor() { ImagemFalsa.criadas++; }
  decode(): Promise<void> { return this.src.includes('quebrada') ? Promise.reject(new Error('sem imagem')) : Promise.resolve(); }
}

beforeAll(async () => {
  vi.stubGlobal('fetch', async () => ({ ok: true, json: async () => ({ A: { f: 'a' }, B: { f: 'b', v: 'b2' }, T: { ficha: true } }) }));
  await carregarCartas();
  vi.stubGlobal('Image', ImagemFalsa);
});

afterEach(() => { zerarImagens(); ImagemFalsa.criadas = 0; });

describe('imagens prontas antes de a carta aparecer (N30)', () => {
  it('decodifica uma vez por endereço e reaproveita a promessa', async () => {
    const p1 = prepararImagem('/img/a/frente/p');
    const p2 = prepararImagem('/img/a/frente/p');
    expect(p1).toBe(p2);
    expect(ImagemFalsa.criadas).toBe(1);
    expect(imagemPronta('/img/a/frente/p')).toBe(false);
    await p1;
    expect(imagemPronta('/img/a/frente/p')).toBe(true);
  });

  it('a falha resolve (ninguém fica esperando) e sai do mapa para tentar de novo depois', async () => {
    await expect(prepararImagem('/img/quebrada/frente/p')).resolves.toBeUndefined();
    expect(imagemPronta('/img/quebrada/frente/p')).toBe(false);
    await prepararImagem('/img/quebrada/frente/p');
    expect(ImagemFalsa.criadas).toBe(2);
  });

  it('sem endereço não faz nada', async () => {
    await prepararImagem(null);
    expect(ImagemFalsa.criadas).toBe(0);
  });

  it('a vista prepara a pilha, o campo (com a face certa), a mão, o comando e o topo dos cemitérios', () => {
    const o = (def: string, face = 0) => ({ def, face }) as unknown as ObjView;
    const v = {
      stack: [{ kind: 'spell', def: 'A' }, { kind: 'triggered', def: 'B' }],
      battlefield: [o('B', 1), o('T')],
      hand: [o('A')],
      command: [o('B')],
      players: [{ graveyard: [o('B'), o('A')] }, { graveyard: [] }],
    } as unknown as GameView;
    expect(urlsDaVista(v).sort()).toEqual(['/img/a/frente/p', '/img/b/frente/p', '/img/b2/verso/p'].sort());
  });
});
