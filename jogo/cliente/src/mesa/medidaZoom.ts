// Tamanho e posição do zoom (a carta ampliada ao passar o mouse), sem DOM: sempre colado à
// esquerda ou à direita da mesa, centralizado na altura da tela e proporcional a ela. Com pouco
// texto, o texto fica embaixo da carta; com muito, a carta encolhe um pouco e, se ainda não couber,
// o texto passa para o lado e a coluna dele alarga até caber. Nunca sai da tela nem corta.
// Testado em testes/fase9-janelas.test.ts.

export interface Tela {
  /** largura útil (a mesa, sem a barra lateral) */
  largura: number;
  altura: number;
}

export interface MedidaZoom {
  /** texto embaixo da carta ou ao lado dela */
  modo: 'abaixo' | 'lado';
  /** largura da imagem da carta */
  imagem: number;
  /** largura da coluna de texto */
  texto: number;
  /** tamanho da caixa inteira (com o acolchoamento) */
  largura: number;
  altura: number;
  /** distância do topo da tela (a caixa fica centralizada na altura) */
  topo: number;
  /** escala da letra (1 = normal); só fica menor que 1 se nem a coluna mais larga couber */
  escala: number;
}

export const MARGEM_ZOOM = 16;
/** acolchoamento da caixa (cada lado) e espaço entre a imagem e o texto */
export const PAD_ZOOM = 8;
export const VAO_ZOOM = 10;
const PROPORCAO = 88 / 63;

/** largura da imagem: cerca de 40% da altura da tela, sem passar de 30% da largura */
export function larguraImagemZoom(t: Tela): number {
  return Math.round(Math.max(220, Math.min(t.altura * 0.4, t.largura * 0.3, 620)));
}

/**
 * `alturaTexto(largura, escala)` mede o bloco de texto naquela largura e escala de letra (no
 * navegador, medindo o próprio elemento).
 */
export function medidaZoom(t: Tela, alturaTexto: (largura: number, escala: number) => number): MedidaZoom {
  const disponivel = t.altura - 2 * MARGEM_ZOOM;
  const base = larguraImagemZoom(t);
  const caixa = (modo: MedidaZoom['modo'], imagem: number, texto: number, escala: number): MedidaZoom => {
    const ih = imagem * PROPORCAO;
    const th = alturaTexto(texto, escala);
    const largura = modo === 'abaixo' ? imagem + 2 * PAD_ZOOM : imagem + VAO_ZOOM + texto + 2 * PAD_ZOOM;
    const altura = Math.ceil((modo === 'abaixo' ? ih + th : Math.max(ih, th)) + 2 * PAD_ZOOM);
    return { modo, imagem, texto, largura: Math.round(largura), altura, topo: Math.round((t.altura - altura) / 2), escala };
  };
  // texto embaixo: a carta pode encolher até 80% para o texto caber
  for (const f of [1, 0.9, 0.8]) {
    const w = Math.round(base * f);
    const m = caixa('abaixo', w, w, 1);
    if (m.altura <= disponivel) return m;
  }
  // texto ao lado: a coluna começa mais estreita que a carta e alarga até caber (sem sair da mesa)
  const imagem = Math.round(Math.min(base, (disponivel - 2 * PAD_ZOOM) / PROPORCAO));
  const maxTexto = Math.max(200, t.largura - 2 * MARGEM_ZOOM - imagem - VAO_ZOOM - 2 * PAD_ZOOM);
  let ultimo: MedidaZoom | null = null;
  for (let w = Math.min(maxTexto, Math.max(240, Math.round(imagem * 0.8))); ; w = Math.min(maxTexto, w + 60)) {
    ultimo = caixa('lado', imagem, w, 1);
    if (ultimo.altura <= disponivel || w >= maxTexto) break;
  }
  if (ultimo.altura <= disponivel) return ultimo;
  // nem a coluna mais larga coube: a letra diminui até caber (no mínimo 60%)
  for (let e = 0.92; e >= 0.6; e -= 0.08) {
    const m = caixa('lado', imagem, ultimo.texto, Math.round(e * 100) / 100);
    if (m.altura <= disponivel) return m;
  }
  return { ...caixa('lado', imagem, ultimo.texto, 0.6), altura: disponivel, topo: MARGEM_ZOOM };
}
