// Abre o Como jogar de qualquer lugar (menu da mesa, tela inicial, saguão). Mesma forma do relato de erro
// (relato/relatoLoja.ts): uma variável do módulo e quem estiver ouvindo.

import { useEffect, useState } from 'preact/hooks';

let aberto = false;
/** o que tinha o foco quando o tutorial abriu (o botão clicado): ao fechar, o foco volta para ele */
let origem: HTMLElement | null = null;
const ouvintes = new Set<(a: boolean) => void>();

function mudar(a: boolean): void {
  if (a === aberto) return;
  aberto = a;
  for (const f of ouvintes) f(a);
}

export function abrirTutorial(): void {
  if (!aberto) origem = typeof document !== 'undefined' ? document.activeElement as HTMLElement | null : null;
  mudar(true);
}

export function fecharTutorial(): void {
  if (!aberto) return;
  mudar(false);
  // depois que a página do tutorial saiu da tela (o navegador manda o foco para o <body> quando ela some)
  const volta = origem;
  origem = null;
  requestAnimationFrame(() => requestAnimationFrame(() => { if (volta?.isConnected) volta.focus({ preventScroll: true }); }));
}

export function useTutorial(): boolean {
  const [a, setA] = useState(aberto);
  useEffect(() => {
    ouvintes.add(setA);
    setA(aberto);
    return () => { ouvintes.delete(setA); };
  }, []);
  return a;
}
