// Só este componente se atualiza por segundo; a mesa e a loja continuam seguindo as mensagens do servidor.
import { useEffect, useState } from 'preact/hooks';
import type { SalaPublica } from '../../../servidor/protocolo.ts';
import { formatarTempo, tempoDePartida, type ReferenciaRelogio } from '../cronometro.ts';
import { IconeRelogio } from '../icones.tsx';

export function Cronometro({ cronometro, relogio }: { cronometro: SalaPublica['cronometro']; relogio: ReferenciaRelogio | null }) {
  const [, atualizar] = useState(0);
  useEffect(() => {
    if (!cronometro || cronometro.encerradaEm !== null || !relogio) return;
    const contar = () => atualizar((n) => n + 1);
    const aoVoltar = () => { if (document.visibilityState === 'visible') contar(); };
    const intervalo = setInterval(contar, 1000);
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [cronometro?.iniciadaEm, cronometro?.encerradaEm, relogio]);

  const segundos = tempoDePartida(cronometro, relogio);
  const descricao = segundos === null ? 'Tempo de partida. Tempo indisponível para esta partida' : 'Tempo de partida';
  return <div class="cronometro-partida" role="timer" aria-label={descricao} aria-live="off" title={descricao}>
    <IconeRelogio /><span>{formatarTempo(segundos)}</span>
  </div>;
}
