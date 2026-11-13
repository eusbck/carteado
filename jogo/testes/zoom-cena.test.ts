// Revisão 2 do estudo do Arena, N24: com a cena andando, o mouse não troca o zoom (as cartas passando por baixo do
// ponteiro parado faziam o zoom piscar); quando a cena acaba, o zoom abre na carta em que o mouse ficou. Esconder de
// propósito (arrastar, abrir uma janela) vale mesmo durante a cena.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ObjView } from '../motor/view.ts';

vi.stubGlobal('innerWidth', 1000);
const z = await import('../cliente/src/mesa/zoomLoja.ts');

/** o zoom atual, lido como o componente lê (o hook só devolve a variável do módulo) */
let atual: ReturnType<typeof z.useZoom> = null;
vi.mock('preact/hooks', () => ({ useState: () => [0, () => {}], useEffect: () => {} }));
const ler = () => { atual = z.useZoom(); return atual; };

const carta = (id: number) => ({ id }) as unknown as ObjView;
const naEsquerda = { left: 100, width: 60 } as DOMRect;
const naDireita = { left: 800, width: 60 } as DOMRect;

beforeEach(() => { z.segurarZoom(false); z.esconderZoom(); });

describe('zoom que espera a cena (N24)', () => {
  it('sem cena, o mouse troca o zoom na hora, do lado oposto ao da carta', () => {
    z.mostrarZoom(carta(1), naEsquerda);
    expect(ler()).toMatchObject({ o: { id: 1 }, lado: 'dir' });
    z.mostrarZoom(carta(2), naDireita);
    expect(ler()).toMatchObject({ o: { id: 2 }, lado: 'esq' });
  });

  it('com a cena andando, o zoom fica parado e, no fim, abre na última carta sob o mouse', () => {
    z.mostrarZoom(carta(1), naEsquerda);
    z.segurarZoom(true);
    z.mostrarZoom(null);
    z.mostrarZoom(carta(2), naDireita);
    z.mostrarZoom(null);
    z.mostrarZoom(carta(3), naEsquerda);
    expect(ler()?.o.id).toBe(1);
    z.segurarZoom(false);
    expect(ler()).toMatchObject({ o: { id: 3 }, lado: 'dir' });
  });

  it('se o mouse saiu de todas as cartas durante a cena, o zoom fecha no fim', () => {
    z.mostrarZoom(carta(1), naEsquerda);
    z.segurarZoom(true);
    z.mostrarZoom(null);
    expect(ler()?.o.id).toBe(1);
    z.segurarZoom(false);
    expect(ler()).toBeNull();
  });

  it('se o mouse não se mexeu durante a cena, o zoom continua o mesmo', () => {
    z.mostrarZoom(carta(1), naEsquerda);
    z.segurarZoom(true);
    z.segurarZoom(false);
    expect(ler()?.o.id).toBe(1);
  });

  it('esconder de propósito vale durante a cena, e o fim da cena não reabre', () => {
    z.mostrarZoom(carta(1), naEsquerda);
    z.segurarZoom(true);
    z.esconderZoom();
    expect(ler()).toBeNull();
    z.segurarZoom(false);
    expect(ler()).toBeNull();
  });
});
