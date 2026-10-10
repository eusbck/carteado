// Preferências desta pessoa neste navegador (não vão para o servidor): auxílios, sons e efeitos.
// Mudam na hora, inclusive no meio da partida, e não mexem em nada para os outros.

import { useEffect, useState } from 'preact/hooks';

/** cada ajuda da interface que a mesa real dispensa */
export type Auxilio = 'jogaveis' | 'alvos' | 'terrenos' | 'avisos' | 'pagarAuto';
export type Nivel = 'real' | 'leve' | 'completo' | 'personalizado';

export const AUXILIOS: { id: Auxilio; nome: string; descricao: string }[] = [
  { id: 'jogaveis', nome: 'Brilho nas cartas jogáveis', descricao: 'contorno laranja no que dá para usar agora; criaturas com enjoo apagadas; o jogo passa sozinho quando você não tem jogada' },
  { id: 'alvos', nome: 'Brilho nos alvos válidos', descricao: 'ao mirar, atacar ou bloquear, o que pode ser escolhido brilha; listas de escolha mostram só o que vale' },
  { id: 'terrenos', nome: 'Brilho nos terrenos ao pagar', descricao: 'as fontes de mana brilham e o pagamento fecha sozinho quando a reserva cobre o custo' },
  { id: 'avisos', nome: 'Aviso de por que não dá', descricao: 'mostra o motivo ("Terrenos só no seu turno", "Falta mana…"), o "Solte para conjurar" e o dano letal sugerido' },
  { id: 'pagarAuto', nome: 'Pagar automaticamente', descricao: 'o jogo vira os terrenos por você' },
];

export const NIVEIS: { id: Nivel; nome: string; descricao: string }[] = [
  { id: 'real', nome: 'Mesa real', descricao: 'nenhum auxílio' },
  { id: 'leve', nome: 'Leve', descricao: 'só o brilho nas cartas jogáveis' },
  { id: 'completo', nome: 'Completo', descricao: 'tudo, menos pagar automaticamente' },
  { id: 'personalizado', nome: 'Personalizado', descricao: 'você escolhe cada um' },
];

export type Auxilios = Record<Auxilio, boolean>;
const NENHUM: Auxilios = { jogaveis: false, alvos: false, terrenos: false, avisos: false, pagarAuto: false };

/** turnoMeu: começou o seu turno; turnoAdversario: começou o turno de outro jogador; chat: mensagem de outra pessoa;
 * abertura: o impacto da tela VS quando a partida começa; investida: o ataque declarado; impacto: cada golpe do dano de
 * combate */
export type Som = 'turnoMeu' | 'turnoAdversario' | 'dano' | 'vida' | 'chat' | 'abertura' | 'investida' | 'impacto';

export interface Preferencias {
  nivel: Nivel;
  /** barra lateral aberta, com o chat (sem valor: segue a barra da fase 7); veja barraAberta(). O nome é de quando
   * a barra mostrava o registro da partida, que hoje abre numa janela */
  registro?: boolean;
  /** as caixas do nível Personalizado */
  personalizado: Auxilios;
  /** volume dos efeitos sonoros, de 0 a 1 */
  volume: number;
  sons: Record<Som, boolean>;
  /** música de fundo da mesa (cliente/src/musica.ts) e o volume dela, de 0 a 1, separado dos efeitos */
  musica: boolean;
  volumeMusica: number;
  /** tremida, brilho, números flutuando, ataques avançando, cartas indo para o cemitério */
  efeitos: boolean;
  /** o seu retrato no canto de cima à direita da sua área (sem valor: no meio da base, na frente da mão) */
  avatarCanto?: boolean;
  /** modo Desempenho, para computadores mais fracos (desligado por padrão, só por escolha da pessoa): sem desfoques,
   * wallpapers sem o zoom lento, sem brasas na entrada nem partículas na tela VS, aura do avatar parada, sem os brilhos
   * animados de dano, e a música tocada por <audio> em vez de decodificada inteira na memória. Vale por
   * <html data-desempenho> (estilo.css) e nos poucos pontos em JavaScript que leem esta chave */
  desempenho: boolean;
}

const CHAVE = 'commander-da-mesa:preferencias';
const PADRAO: Preferencias = { nivel: 'real', personalizado: { ...NENHUM }, volume: 0.7, sons: { turnoMeu: true, turnoAdversario: true, dano: true, vida: true, chat: true, abertura: true, investida: true, impacto: true }, musica: true, volumeMusica: 0.4, efeitos: true, desempenho: false };

function ler(): Preferencias {
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE) ?? '{}') as Partial<Preferencias> & { pagarAuto?: boolean };
    // até a fase 8 havia um som só para a troca de turno: quem o desligou fica com os dois desligados
    const { turno, ...sons } = (s.sons ?? {}) as Partial<Record<Som | 'turno', boolean>>;
    const p: Preferencias = { ...PADRAO, ...s, personalizado: { ...NENHUM, ...s.personalizado }, sons: { ...PADRAO.sons, ...(turno === false ? { turnoMeu: false, turnoAdversario: false } : {}), ...sons } };
    // da fase 7: quem tinha ligado "pagar automaticamente por padrão" continua pagando sozinho
    if (!s.nivel && s.pagarAuto) { p.nivel = 'personalizado'; p.personalizado = { ...NENHUM, pagarAuto: true }; }
    if (!NIVEIS.some((n) => n.id === p.nivel)) p.nivel = 'real';
    return p;
  } catch {
    return structuredClone(PADRAO);
  }
}

let atual = ler();
const ouvintes = new Set<() => void>();

/** o modo Desempenho no <html>, onde o CSS o lê (desde o primeiro desenho: este módulo carrega antes das telas) */
function marcarDesempenho(): void {
  if (typeof document !== 'undefined') document.documentElement.toggleAttribute('data-desempenho', atual.desempenho === true);
}
marcarDesempenho();

export function preferencias(): Preferencias { return atual; }
export function mudarPreferencias(p: Partial<Preferencias>): void {
  atual = { ...atual, ...p };
  try { localStorage.setItem(CHAVE, JSON.stringify(atual)); } catch { /* sem armazenamento: vale até fechar a página */ }
  marcarDesempenho();
  for (const f of ouvintes) f();
}
export function usePreferencias(): Preferencias {
  const [, forcar] = useState(0);
  useEffect(() => { const f = () => forcar((x) => x + 1); ouvintes.add(f); return () => { ouvintes.delete(f); }; }, []);
  return atual;
}

/** onde a fase 7 guardava a barra lateral recolhida */
const CHAVE_LATERAL_ANTIGA = 'commander-da-mesa:lateral-recolhida';
/** a barra lateral está aberta (com o chat)? Recolhida, ela fica só com os ícones e a mesa ocupa o resto */
export function barraAberta(p: Preferencias): boolean {
  if (p.registro !== undefined) return p.registro;
  try { return localStorage.getItem(CHAVE_LATERAL_ANTIGA) !== '1'; } catch { return true; }
}

/** os auxílios de um nível (no Personalizado, as caixas marcadas) */
export function auxiliosDoNivel(nivel: Nivel, personalizado: Auxilios): Auxilios {
  switch (nivel) {
    case 'real': return { ...NENHUM };
    case 'leve': return { ...NENHUM, jogaveis: true };
    case 'completo': return { jogaveis: true, alvos: true, terrenos: true, avisos: true, pagarAuto: false };
    case 'personalizado': return { ...personalizado };
  }
}

/** os auxílios que valem agora: os da pessoa, ou nenhum se a sala proíbe */
export function auxiliosAtivos(p: Preferencias, salaProibe: boolean): Auxilios {
  return salaProibe ? { ...NENHUM } : auxiliosDoNivel(p.nivel, p.personalizado);
}
