// Ponte até o N34 (o estado esperar a cena, pelos eventos): o que acabou de acontecer só aparece quando a cena que o
// mostra termina. Hoje vale para o fim da partida: a área do eliminado escurece e os avisos "perde a partida" e
// "vence a partida" chegavam junto com a vista, antes de os golpes que acabaram a partida chegarem ao alvo.

import { useEffect, useState } from 'preact/hooks';
import { aoMudarCena, emCena } from './cenaLoja.ts';

/**
 * `valor` que vira true durante uma cena só aparece true quando ela acaba; voltar a false é na hora. Na primeira
 * vista (entrar, reconectar) vale o que veio. Só assina a cena enquanto espera: a mesa parada não paga nada.
 */
export function useDepoisDaCena(valor: boolean): boolean {
  const [mostrado, setMostrado] = useState(valor);
  useEffect(() => {
    if (!valor) { if (mostrado) setMostrado(false); return; }
    if (mostrado) return;
    if (!emCena()) { setMostrado(true); return; }
    return aoMudarCena(() => { if (!emCena()) setMostrado(true); });
  }, [valor, mostrado]);
  return valor && mostrado;
}
