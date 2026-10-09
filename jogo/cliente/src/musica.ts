// Música de fundo da mesa: uma faixa épica orquestral de licença livre (fonte, autor e licença em
// cliente/src/musica/CREDITOS.md e na janela de Configurações), guardada no repositório e servida
// pelo nosso servidor (o Vite a copia para /assets com o nome versionado).
//
// Toca com Web Audio, a faixa decodificada uma vez num AudioBuffer (o <audio loop> deixa um
// silêncio na volta). A faixa termina com um acorde que se apaga e começa com um ataque: cada volta
// nova entra no tempo, um compasso depois do acorde final, por cima da cauda da anterior, que sai
// num cruzamento curto. As voltas são marcadas no relógio do áudio, sempre uma à frente, então a
// emenda não tem corte nem buraco (os pontos estão medidos em cliente/src/musica/CREDITOS.md).
//
// O navegador só deixa tocar depois do primeiro clique ou tecla: até lá a música só espera, sem
// criar o contexto de áudio (o que deixaria aviso no console), e começa no primeiro gesto.
// O estado fica em <html data-musica> ("esperando", "carregando", "tocando", "parada"), que as
// capturas conferem.
//
// No modo Desempenho (Configurações) a faixa toca por um <audio loop>, ligado ao mesmo ganho (as
// entradas, as saídas e o abafar continuam): o navegador decodifica aos poucos, sem guardar os
// ~80 MB do AudioBuffer. A volta tem o silêncio do fim do arquivo; a emenda sem corte é do modo
// padrão.

import { useEffect } from 'preact/hooks';
import arquivo from './musica/the-snow-queen.mp3?url';
import { preferencias, usePreferencias } from './preferencias.ts';
import { contexto, quandoLiberado } from './sons.ts';

/** o crédito pedido pela licença (CC BY 4.0), mostrado nas Configurações */
export const FAIXA = {
  titulo: 'The Snow Queen',
  autor: 'Kevin MacLeod (incompetech.com)',
  pagina: 'https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100872',
  licenca: 'CC BY 4.0',
  licencaUrl: 'https://creativecommons.org/licenses/by/4.0/',
  nota: undefined as string | undefined,
};

/**
 * A volta seguinte entra este tanto de segundos depois do começo do som: um compasso (96 bpm) depois
 * do acorde final, que cai no primeiro tempo do compasso 87. O resto da faixa (a cauda do acorde,
 * uns 2,6 s) toca por baixo da volta nova e sai num cruzamento.
 */
const PONTO_DA_VOLTA = 217.38;
/** a primeira entrada e a saída (desligar, sair da mesa) são suaves */
const ENTRADA = 2.5;
const SAIDA = 0.8;

/** o controle vai de 0 a 1; o ganho sobe com o quadrado, para ter ajuste fino no volume baixo */
export const ganhoDaMusica = (v: number) => Math.min(1, Math.max(0, v)) ** 2;

type Estado = 'esperando' | 'carregando' | 'tocando' | 'parada';
const marcar = (e: Estado) => { if (typeof document !== 'undefined') document.documentElement.dataset.musica = e; };

let pedidos = 0;
let carregando: Promise<AudioBuffer | null> | null = null;
let saida: GainNode | null = null;
/** o que está tocando: as voltas marcadas do AudioBuffer, ou (modo Desempenho) o <audio> com o ganho da entrada */
let laco: { fontes: Set<AudioBufferSourceNode>; timer: ReturnType<typeof setTimeout> | null; elemento?: { el: Elemento; entrada: GainNode } } | null = null;
let geracao = 0;

/** o <audio> do modo Desempenho, ligado ao contexto uma vez só (createMediaElementSource não pode repetir) */
interface Elemento { audio: HTMLAudioElement; fonte: MediaElementAudioSourceNode }
let elemento: Elemento | null = null;
function elementoDaMusica(c: AudioContext): Elemento {
  if (!elemento || elemento.fonte.context !== c) {
    const audio = new Audio(arquivo);
    audio.loop = true;
    audio.preload = 'auto';
    elemento = { audio, fonte: c.createMediaElementSource(audio) };
  }
  return elemento;
}

/** modo Desempenho: o <audio> desde o começo, entrando devagar como a primeira volta do modo padrão */
function comecarElemento(c: AudioContext, destino: AudioNode): void {
  const el = elementoDaMusica(c);
  const entrada = c.createGain();
  entrada.gain.setValueAtTime(0, c.currentTime);
  entrada.gain.linearRampToValueAtTime(1, c.currentTime + ENTRADA);
  el.fonte.connect(entrada).connect(destino);
  el.audio.currentTime = 0;
  laco = { fontes: new Set(), timer: null, elemento: { el, entrada } };
  const minha = geracao;
  marcar('carregando');
  el.audio.play().then(
    () => { if (minha === geracao) marcar('tocando'); },
    (e: unknown) => { console.warn('Música indisponível:', e); if (minha === geracao) marcar('parada'); },
  );
}

function carregar(c: AudioContext): Promise<AudioBuffer | null> {
  carregando ??= fetch(arquivo)
    .then((r) => { if (!r.ok) throw new Error(`música: ${r.status}`); return r.arrayBuffer(); })
    .then((b) => c.decodeAudioData(b))
    .then((b) => b, (e: unknown) => { console.warn('Música indisponível:', e); carregando = null; return null; });
  return carregando;
}

/** começo e fim do som de verdade (sem o silêncio que o arquivo tem nas pontas), em segundos */
function trecho(b: AudioBuffer): [number, number] {
  const limiar = 1e-3;
  const canais = Array.from({ length: b.numberOfChannels }, (_, i) => b.getChannelData(i));
  const alto = (i: number) => canais.some((d) => Math.abs(d[i]) > limiar);
  let ini = 0;
  while (ini < b.length - 1 && !alto(ini)) ini++;
  let fim = b.length - 1;
  while (fim > ini && !alto(fim)) fim--;
  return [ini / b.sampleRate, (fim + 1) / b.sampleRate];
}

/** curva de saída da cauda (cosseno: some sem degrau) */
const curva = (sobe: boolean) => Float32Array.from({ length: 64 }, (_, i) => {
  const x = i / 63;
  return sobe ? Math.sin((x * Math.PI) / 2) : Math.cos((x * Math.PI) / 2);
});

/**
 * As voltas da faixa no relógio de `c`, a partir de `inicio`: cada chamada de `marcar` põe mais uma
 * (separado de `comecar` para dar para gravar a emenda num OfflineAudioContext e conferir).
 */
export function voltas(c: BaseAudioContext, b: AudioBuffer, destino: AudioNode, inicio: number) {
  const [ini, fim] = trecho(b);
  // do começo do som até o ponto da volta (num arquivo mais curto que isso, até 4 s antes do fim)
  const passo = PONTO_DA_VOLTA < fim - ini - 0.5 ? PONTO_DA_VOLTA : fim - ini - 4;
  const cauda = fim - ini - passo;
  let quando = inicio;
  let primeira = true;
  const marcar = () => {
    const s = c.createBufferSource();
    s.buffer = b;
    const g = c.createGain();
    s.connect(g).connect(destino);
    g.gain.setValueAtTime(0, quando);
    // a primeira entra devagar; as seguintes entram inteiras, no tempo (só 30 ms contra estalo)
    g.gain.linearRampToValueAtTime(1, quando + (primeira ? ENTRADA : 0.03));
    g.gain.setValueCurveAtTime(curva(false), quando + passo, cauda);
    s.start(quando, ini, fim - ini);
    s.onended = () => g.disconnect();
    primeira = false;
    quando += passo;
    return s;
  };
  return { marcar, passo };
}

function comecar(c: AudioContext, b: AudioBuffer, destino: AudioNode): void {
  const fontes = new Set<AudioBufferSourceNode>();
  laco = { fontes, timer: null };
  const meu = laco;
  const { marcar, passo } = voltas(c, b, destino, c.currentTime + 0.05);
  /** marca a próxima volta no relógio do áudio, que é preciso (o setTimeout só lembra de marcar) */
  const marcarVolta = () => {
    const s = marcar();
    fontes.add(s);
    s.addEventListener('ended', () => fontes.delete(s));
  };
  // fica sempre uma volta marcada à frente: um setTimeout atrasado (aba em segundo plano) não abre buraco
  marcarVolta();
  marcarVolta();
  const tique = () => {
    if (laco !== meu) return;
    marcarVolta();
    meu.timer = setTimeout(tique, passo * 1000);
  };
  meu.timer = setTimeout(tique, passo * 1000);
}

function parar(): void {
  geracao++;
  const l = laco;
  laco = null;
  if (l?.timer) clearTimeout(l.timer);
  const c = saida?.context;
  if (l && saida && c) {
    saida.gain.cancelScheduledValues(c.currentTime);
    saida.gain.setTargetAtTime(0, c.currentTime, SAIDA / 4);
    const velha = saida;
    saida = null;
    setTimeout(() => {
      for (const s of l.fontes) { try { s.stop(); } catch { /* já parou */ } }
      if (l.elemento) {
        l.elemento.el.fonte.disconnect(l.elemento.entrada);
        // a música pode ter voltado pelo mesmo <audio> durante a saída: aí ele continua
        if (laco?.elemento?.el !== l.elemento.el) l.elemento.el.audio.pause();
      }
      velha.disconnect();
    }, SAIDA * 1000 + 200);
  }
}

/** liga, desliga ou ajusta o volume conforme a mesa e as Configurações */
function atualizar(): void {
  const p = preferencias();
  if (!pedidos || !p.musica || p.volumeMusica <= 0) { parar(); marcar('parada'); return; }
  const c = contexto();
  if (!c || c.state !== 'running') { marcar('esperando'); quandoLiberado(atualizar); return; }
  const desempenho = p.desempenho === true;
  if (laco && saida) {
    if (!!laco.elemento === desempenho) {
      saida.gain.cancelScheduledValues(c.currentTime);
      saida.gain.setTargetAtTime(ganhoDaMusica(p.volumeMusica), c.currentTime, 0.08);
      return;
    }
    // trocou o modo Desempenho com a música tocando: a de agora sai e a do outro jeito entra
    parar();
  }
  if (desempenho) {
    // a faixa decodificada (se havia) não é mais usada: fica para o coletor de lixo
    carregando = null;
    geracao++;
    saida = c.createGain();
    saida.gain.value = ganhoDaMusica(p.volumeMusica);
    saida.connect(c.destination);
    comecarElemento(c, saida);
    return;
  }
  const minha = ++geracao;
  marcar('carregando');
  void carregar(c).then((b) => {
    if (minha !== geracao || !b) { if (!b) marcar('parada'); return; }
    const p2 = preferencias();
    saida = c.createGain();
    saida.gain.value = ganhoDaMusica(p2.volumeMusica);
    saida.connect(c.destination);
    comecar(c, b, saida);
    marcar('tocando');
  });
}

/** a música abaixa um pouco por um momento (o som do seu turno passa por cima dela) */
export function abafarMusica(segundos = 1.2): void {
  const c = saida?.context;
  if (!saida || !c || !laco) return;
  const alvo = ganhoDaMusica(preferencias().volumeMusica);
  const t = c.currentTime;
  saida.gain.cancelScheduledValues(t);
  saida.gain.setTargetAtTime(alvo * 0.4, t, 0.04);
  saida.gain.setTargetAtTime(alvo, t + segundos, 0.35);
}

// decodificar a faixa leva uns segundos (fora da linha principal): começa assim que o áudio é
// liberado (o clique em "Entrar", no saguão), para a música já estar pronta quando a mesa abrir
quandoLiberado(() => {
  const c = contexto();
  // no modo Desempenho a faixa não é decodificada inteira (toca pelo <audio>)
  if (c && preferencias().musica && !preferencias().desempenho) void carregar(c);
});

/** a mesa toca a música enquanto está na tela, com o volume e a chave das Configurações */
export function useMusica(): void {
  const p = usePreferencias();
  useEffect(() => {
    pedidos++;
    atualizar();
    return () => { pedidos--; atualizar(); };
  }, []);
  useEffect(() => { atualizar(); }, [p.musica, p.volumeMusica, p.desempenho]);
}
