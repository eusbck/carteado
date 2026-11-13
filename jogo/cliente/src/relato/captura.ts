// Imagens dos relatos de erro:
// - printDaPagina: desenha a página numa imagem (modern-screenshot), sem pedir nada à pessoa. É o print automático
//   que o relato tira ao abrir.
// - printDaAba: a captura da aba pelo próprio navegador (getDisplayMedia): pede permissão, mas sai idêntica ao que
//   está na tela (vídeos, efeitos e o que o desenho da página não reproduz).
// - imagemDeArquivo: imagem anexada ou colada.
// Todas saem como data URL WebP (ou PNG, no navegador que não gera WebP), com no máximo LADO_MAXIMO pixels de lado.

const LADO_MAXIMO = 2400;
const QUALIDADE = 0.9;

/** elementos com esta classe ficam fora do print (o aviso "Tirando o print…", o botão de reportar) */
export const FORA_DO_PRINT = 'relato-fora';

function reduzir(origem: CanvasImageSource, largura: number, altura: number): string {
  const k = Math.min(1, LADO_MAXIMO / Math.max(largura, altura));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(largura * k));
  c.height = Math.max(1, Math.round(altura * k));
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(origem, 0, 0, c.width, c.height);
  const webp = c.toDataURL('image/webp', QUALIDADE);
  return webp.startsWith('data:image/webp') ? webp : c.toDataURL('image/png');
}

/** desenha um canvas já pronto (o Marcador) no formato do relato */
export const canvasParaDados = (c: HTMLCanvasElement): string => reduzir(c, c.width, c.height);

function comPrazo<T>(p: Promise<T>, ms: number, msg: string): Promise<T> {
  return new Promise((ok, falha) => {
    const t = setTimeout(() => falha(new Error(msg)), ms);
    p.then((v) => { clearTimeout(t); ok(v); }, (e) => { clearTimeout(t); falha(e); });
  });
}

/** o print da página como está agora (sem os elementos marcados com FORA_DO_PRINT) */
export async function printDaPagina(): Promise<string> {
  // carregado só quando alguém reporta: a biblioteca não pesa na abertura do jogo
  const { domToCanvas } = await import('modern-screenshot');
  const canvas = await comPrazo(domToCanvas(document.body, {
    width: innerWidth,
    height: innerHeight,
    // nitidez de tela comum mesmo em telas de alta densidade (o arquivo fica 4x menor que em 2x)
    scale: Math.min(devicePixelRatio || 1, 1.5),
    backgroundColor: getComputedStyle(document.body).backgroundColor || '#121113',
    filter: (n) => !(n instanceof Element && n.classList.contains(FORA_DO_PRINT)),
    // o clone do body sai com a margem padrão do navegador (8px) e o print ficava deslocado
    style: { margin: '0' },
    timeout: 8000,
  }), 25000, 'O print demorou demais');
  return reduzir(canvas, canvas.width, canvas.height);
}

export const podeCapturarAba = (): boolean => typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia;

/** a captura da aba pelo navegador; `antes` roda depois da permissão e antes do quadro (para esconder a janela) */
export async function printDaAba(antes: () => Promise<void>): Promise<string> {
  const opcoes = {
    video: { displaySurface: 'browser', frameRate: 5 },
    audio: false,
    // Chrome/Edge: oferece direto "esta aba"
    preferCurrentTab: true,
    selfBrowserSurface: 'include',
    surfaceSwitching: 'exclude',
  } as DisplayMediaStreamOptions;
  const stream = await navigator.mediaDevices.getDisplayMedia(opcoes);
  try {
    await antes();
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await video.play();
    // dois quadros: o primeiro às vezes ainda é o de antes de esconder a janela
    await new Promise((ok) => setTimeout(ok, 450));
    return reduzir(video, video.videoWidth, video.videoHeight);
  } finally {
    for (const t of stream.getTracks()) t.stop();
  }
}

/** imagem anexada ou colada, reduzida e convertida */
export async function imagemDeArquivo(arquivo: Blob): Promise<string> {
  if (!arquivo.type.startsWith('image/')) throw new Error('Isso não é uma imagem');
  const bitmap = await createImageBitmap(arquivo);
  try { return reduzir(bitmap, bitmap.width, bitmap.height); } finally { bitmap.close(); }
}

/** tamanho aproximado em bytes de um data URL (para mostrar e para o limite do envio) */
export const bytesDe = (dados: string): number => Math.round((dados.length - dados.indexOf(',') - 1) * 0.75);
