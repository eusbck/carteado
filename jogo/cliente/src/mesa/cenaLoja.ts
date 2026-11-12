// A cena: o tempo em que a mesa ainda está mostrando o que acabou de acontecer. Começa quando um quadro (uma vista do
// servidor, protocolo-2) entra na tela e acaba quando as animações dele terminam e a fila de quadros esvazia. Enquanto
// isso, a decisão, a janela de escolha e os realces de "pode jogar" esperam (eventos-5, versão ponte; a cena de verdade,
// com passos, é o eventos-4).
//
// Quem é quem:
// - a fila de quadros (filaQuadros.ts, ligada em loja.ts) marca o começo e o fim (marcarCena) e se registra como o
//   controle (ligarControle);
// - Efeitos.tsx diz quanto as animações do quadro atual duram (informarDuracao), com o número que efeitosDaVista
//   (impacto.ts) devolve;
// - a Mesa pula a cena com um clique na mesa ou com Espaço (pularCena) e assina o estado (useCena);
// - o zoom (N24) pergunta emCena() e assina aoMudarCena para não trocar de carta no meio da cena.
//
// O estado é um módulo à parte (e não um campo da loja) para não redesenhar a mesa a cada quadro: só quem assina ouve.

import { useEffect, useState } from 'preact/hooks';

let naFila = 0;
let animando = false;
const ouvintes = new Set<() => void>();

/** true enquanto há quadro na fila ou o quadro atual ainda anima (efeitos, golpes, arrumação) */
export function emCena(): boolean {
  return naFila > 0 || animando;
}

/** quadros ainda por mostrar, contando o que anima agora (0: a mesa está parada) */
export function quadrosPendentes(): number {
  return naFila + (animando ? 1 : 0);
}

/** inscreve um ouvinte das mudanças da cena (começou, acabou, a fila mudou); devolve o cancelar */
export function aoMudarCena(f: () => void): () => void {
  ouvintes.add(f);
  return () => { ouvintes.delete(f); };
}

/** a fila marca o estado: `fila`, quadros esperando; `animando`, o quadro atual ainda anima */
export function marcarCena(fila: number, anima: boolean): void {
  if (fila === naFila && anima === animando) return;
  naFila = fila;
  animando = anima;
  // o sinal para os testes de ponta a ponta e as capturas: data-fila="0" com a mesa parada
  if (typeof document !== 'undefined') document.documentElement.dataset.fila = String(quadrosPendentes());
  for (const f of [...ouvintes]) f();
}

let saltos = 0;
/** a próxima vista não continua a anterior (conectar, partida nova, desfazer): Efeitos.tsx não anima a diferença */
export function vistaSemAnimacao(): void { saltos++; }
/** conta as vistas sem animação (Efeitos.tsx compara com a última que viu) */
export function vistasSemAnimacao(): number { return saltos; }

/** o que a fila de quadros oferece a quem está de fora */
export interface ControleCena {
  /** as animações do quadro que acabou de entrar duram tanto (ms, contados de agora) */
  duracao(ms: number): void;
  /** pula: mostra o último quadro que chegou e encerra a cena na hora */
  pular(): void;
}

let controle: ControleCena | null = null;

/** a fila se registra (uma só); devolve o desligar */
export function ligarControle(c: ControleCena): () => void {
  controle = c;
  return () => { if (controle === c) controle = null; };
}

/** Efeitos.tsx: as animações do quadro atual acabam daqui a `ms` */
export function informarDuracao(ms: number): void {
  controle?.duracao(ms);
}

/** clique na mesa ou Espaço: a decisão aparece na hora */
export function pularCena(): void {
  if (emCena()) controle?.pular();
}

/** a cena como estado do componente (só redesenha quando ela começa ou acaba) */
export function useCena(): boolean {
  const [cena, setCena] = useState(emCena);
  useEffect(() => {
    const ver = () => setCena(emCena());
    ver();
    return aoMudarCena(ver);
  }, []);
  return cena;
}
