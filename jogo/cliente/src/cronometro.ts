// O horário do servidor avança pelo relógio monotônico do navegador, sem depender do relógio local da pessoa.
import type { SalaPublica } from '../../servidor/protocolo.ts';

export interface ReferenciaRelogio {
  agora: number;
  recebidoEm: number;
}

/** segundos inteiros de tempo corrido; o fim prevalece sobre a referência e sobre qualquer tempo que passe depois */
export function tempoDePartida(cronometro: SalaPublica['cronometro'], relogio: ReferenciaRelogio | null, monotono = performance.now()): number | null {
  if (!cronometro) return null;
  const agora = cronometro.encerradaEm ?? (relogio ? relogio.agora + Math.max(0, monotono - relogio.recebidoEm) : null);
  return agora === null ? null : Math.max(0, Math.floor((agora - cronometro.iniciadaEm) / 1000));
}

export function formatarTempo(segundos: number | null): string {
  if (segundos === null) return '--:--';
  const dois = (n: number) => String(n).padStart(2, '0');
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor(segundos / 60) % 60;
  const tempo = `${dois(minutos)}:${dois(segundos % 60)}`;
  return horas ? `${dois(horas)}:${tempo}` : tempo;
}
