// Revisão 2 do estudo do Arena, N30: as imagens das cartas ficam prontas (baixadas e decodificadas) antes de a carta
// aparecer. Cada carta que troca de zona ganha elemento novo, e sem isto a imagem era pedida e decodificada no quadro
// em que a carta surgia: face vazia piscando no meio do voo e o quadro mais lento.
//
// O Arena guarda a arte de cada carta com contagem de uso e solta o que ficou sem uso (90 s para o bloco). Aqui, um
// mapa por endereço (definição, face e tamanho já estão no endereço) com a imagem já decodificada; quem usa a imagem
// toca a entrada, e o que passa 90 s sem toque sai do mapa (o navegador continua com o arquivo no cache dele).
//
// A cada vista nova, as cartas que podem aparecer em seguida (a pilha, o campo, a mão, o comando e o topo dos
// cemitérios) são preparadas no tamanho da mesa ('p'). Um feitiço que entra na pilha já tem a imagem pronta quando
// pousa no campo.

import type { GameView } from '../../motor/view.ts';
import { urlImagem } from './cartas.ts';
import { loja } from './loja.ts';

const SOLTAR_DEPOIS_MS = 90_000;

interface Entrada { img: HTMLImageElement; pronta: Promise<void>; ok: boolean; uso: number }

const cache = new Map<string, Entrada>();

/** quanto tempo as decodificações levaram (de pedir até a imagem ficar pronta) e quantas foram; lido pelas ferramentas
 *  de medida em `window.__imagens` */
const medidas = { decodificadas: 0, falhas: 0, msTotal: 0, msMaior: 0 };

/** prepara (baixa e decodifica) a imagem do endereço; a promessa resolve quando ela está pronta para desenhar ou
 *  quando falhou (quem espera nunca fica preso) */
export function prepararImagem(url: string | null): Promise<void> {
  if (!url || typeof Image === 'undefined') return Promise.resolve();
  const agora = performance.now();
  const e = cache.get(url);
  if (e) { e.uso = agora; return e.pronta; }
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  const nova: Entrada = { img, ok: false, uso: agora, pronta: Promise.resolve() };
  nova.pronta = img.decode().then(
    () => {
      nova.ok = true;
      const ms = performance.now() - agora;
      medidas.decodificadas++;
      medidas.msTotal += ms;
      if (ms > medidas.msMaior) medidas.msMaior = ms;
    },
    () => { medidas.falhas++; cache.delete(url); },
  );
  cache.set(url, nova);
  vigiar();
  return nova.pronta;
}

/** a imagem já está decodificada no mapa */
export function imagemPronta(url: string | null): boolean {
  return !!url && !!cache.get(url)?.ok;
}

/** marca a imagem como em uso (a carta que está na tela), para ela não sair do mapa */
export function tocarImagem(url: string | null): void {
  const e = url ? cache.get(url) : undefined;
  if (e) e.uso = performance.now();
}

/** as cartas que podem aparecer depois desta vista, no tamanho da mesa */
export function urlsDaVista(v: GameView): string[] {
  const urls = new Set<string>();
  const add = (def: string | undefined, face = 0) => { const u = def ? urlImagem(def, face, 'p') : null; if (u) urls.add(u); };
  for (const s of v.stack) if (s.kind === 'spell') add(s.def);
  for (const o of v.battlefield) add(o.copyOfDef ?? o.def, o.face);
  for (const o of v.hand) add(o.def, o.face);
  for (const o of v.command) add(o.def, o.face);
  for (const p of v.players) { const topo = p.graveyard[p.graveyard.length - 1]; if (topo) add(topo.def, topo.face); }
  return [...urls];
}

let ultimaVista: GameView | null = null;
let vigiando = false;
let varredura: ReturnType<typeof setInterval> | null = null;

function aoMudarLoja(): void {
  const v = loja.e.vista;
  if (!v || v === ultimaVista) return;
  ultimaVista = v;
  for (const u of urlsDaVista(v)) void prepararImagem(u);
}

/** liga uma vez: a varredura dos 90 s e o preparo a cada vista nova */
function vigiar(): void {
  if (vigiando) return;
  vigiando = true;
  loja.assinar(aoMudarLoja);
  varredura = setInterval(() => {
    const limite = performance.now() - SOLTAR_DEPOIS_MS;
    for (const [u, e] of cache) if (e.uso < limite) cache.delete(u);
  }, 30_000);
  if (typeof window !== 'undefined') {
    (window as unknown as { __imagens: unknown }).__imagens = { medidas, tamanho: () => cache.size };
  }
}

/** para os testes: esvazia o mapa e as medidas */
export function zerarImagens(): void {
  cache.clear();
  Object.assign(medidas, { decodificadas: 0, falhas: 0, msTotal: 0, msMaior: 0 });
  ultimaVista = null;
  if (varredura) clearInterval(varredura);
  varredura = null;
  vigiando = false;
}

