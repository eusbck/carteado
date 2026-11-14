// Abre o Como jogar de qualquer lugar (menu da mesa, tela inicial, saguão). Mesma forma do relato de erro
// (relato/relatoLoja.ts): uma variável do módulo e quem estiver ouvindo.

import { useEffect, useState } from 'preact/hooks';

let aberto = false;
const ouvintes = new Set<(a: boolean) => void>();

function mudar(a: boolean): void {
  if (a === aberto) return;
  aberto = a;
  for (const f of ouvintes) f(a);
}

export function abrirTutorial(): void { mudar(true); }
export function fecharTutorial(): void { mudar(false); }

export function useTutorial(): boolean {
  const [a, setA] = useState(aberto);
  useEffect(() => {
    ouvintes.add(setA);
    setA(aberto);
    return () => { ouvintes.delete(setA); };
  }, []);
  return a;
}
