// Ícones de linha (traço na cor do texto) e a marca do jogo.

import type { JSX } from 'preact';
import logoM from './imagens/logo-m.png?url';

function Svg({ children }: { children: JSX.Element | JSX.Element[] }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{children}</svg>;
}

export const IconeRegistro = () => <Svg><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Svg>;
export const IconeRelogio = () => <Svg><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>;
export const IconeEnviar = () => <Svg><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></Svg>;
export const IconeParadas = () => <Svg><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z" /><path d="M10 9v6M14 9v6" /></Svg>;
export const IconeAjuste = () => <Svg><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></Svg>;
export const IconeConfig = () => <Svg><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></Svg>;
export const IconeConceder = () => <Svg><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><path d="M4 22v-7" /></Svg>;
export const IconeSair = () => <Svg><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></Svg>;
export const IconeDesfazer = () => <Svg><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></Svg>;
/** inseto: Reportar erro */
export const IconeErro = () => <Svg><path d="M8 2l1.9 1.9M16 2l-1.9 1.9M9 7.13v-1a3 3 0 1 1 6 0v1" /><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6zM12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4" /></Svg>;
/** interrogação num círculo: Como jogar */
export const IconeAjuda = () => <Svg><circle cx="12" cy="12" r="9" /><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.3-2.7 4M12 17.2h.01" /></Svg>;
export const IconeFechar = () => <Svg><path d="M18 6L6 18M6 6l12 12" /></Svg>;
export const IconeRecolher = () => <Svg><path d="M9 18l6-6-6-6" /></Svg>;
export const IconePassar = () => <Svg><path d="M5 4l10 8-10 8V4zM19 5v14" /></Svg>;
export const IconeFimTurno = () => <Svg><path d="M13 19l9-7-9-7v14zM2 19l9-7-9-7v14z" /></Svg>;
/** espada inclinada (atacando) e escudo (bloqueando): os selos do combate */
export const IconeEspada = () => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><g transform="rotate(45 12 12)"><path d="M12 1.6 14.3 4.4V14h-4.6V4.4z" /><rect x="6.6" y="13.6" width="10.8" height="2.4" rx="1.2" /><rect x="10.9" y="16" width="2.2" height="4.2" /><circle cx="12" cy="21.3" r="1.7" /></g></svg>;
export const IconeEscudo = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
export const IconeVida = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" /></svg>;

/** o "M" do logo do Magic, em brasa: ao lado de "COMMANDER" ele faz as vezes de "Magic" (e é o que o leitor de tela lê) */
export const Marca = () => <img class="marca-logo" src={logoM} alt="Magic" draggable={false} />;

// Onda B: um ícone por tipo de linha do Registro (mesmo traço dos outros)
export const IconeRegMagia = () => <Svg><path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></Svg>;
export const IconeRegGatilho = () => <Svg><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></Svg>;
export const IconeRegAtaque = () => <Svg><path d="M14.5 17.5 3 6V3h3l11.5 11.5" /><path d="m13 19 6-6M16 16l4 4M19 21l2-2" /></Svg>;
export const IconeRegDano = () => <Svg><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" /></Svg>;
export const IconeRegVida = () => <Svg><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" /></Svg>;
export const IconeRegMorte = () => <Svg><path d="M12 3a7 7 0 0 0-7 7v3l2 2v3h10v-3l2-2v-3a7 7 0 0 0-7-7z" /><path d="M9 11h.01M15 11h.01M10 18v-2M14 18v-2" /></Svg>;
export const IconeRegCompra = () => <Svg><rect x="6" y="3" width="12" height="17" rx="2" /><path d="M12 8v6M9 11h6" /></Svg>;
export const IconeRegFicha = () => <Svg><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></Svg>;
export const IconeRegSistema = () => <Svg><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v5h1" /></Svg>;
export const IconeRegManual = () => <Svg><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></Svg>;
export const IconeRegOutro = () => <Svg><circle cx="12" cy="12" r="2" /></Svg>;
export const IconeCopiar = () => <Svg><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Svg>;
