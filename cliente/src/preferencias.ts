// Preferências desta pessoa neste navegador (não vão para o servidor): auxílios, sons e efeitos.
// Mudam na hora, inclusive no meio da partida, e não mexem em nada para os outros.

import { useEffect, useState } from 'preact/hooks';

/** cada ajuda da interface que a mesa real dispensa */
export type Auxilio = 'jogaveis' | 'alvos' | 'terrenos' | 'avisos' | 'pagarAuto';
export type Nivel = 'real' | 'leve' | 'completo' | 'personalizado';

export const AUXILIOS: { id: Auxilio; nome: string; descricao: string }[] = [
  { id: 'jogaveis', nome: 'Brilho nas cartas jogáveis', descricao: 'contorno verde no que dá para usar agora; criaturas com enjoo apagadas; o jogo passa sozinho quando você não tem jogada' },
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

export type Som = 'turno' | 'dano' | 'vida';

export interface Preferencias {
  nivel: Nivel;
  /** as caixas do nível Personalizado */
  personalizado: Auxilios;
  /** volume geral, de 0 a 1 */
  volume: number;
  sons: Record<Som, boolean>;
  /** tremida, brilho, números flutuando, ataques avançando, cartas indo para o cemitério */
  efeitos: boolean;
}

const CHAVE = 'commander-da-mesa:preferencias';
const PADRAO: Preferencias = { nivel: 'real', personalizado: { ...NENHUM }, volume: 0.7, sons: { turno: true, dano: true, vida: true }, efeitos: true };

function ler(): Preferencias {
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE) ?? '{}') as Partial<Preferencias> & { pagarAuto?: boolean };
    const p: Preferencias = { ...PADRAO, ...s, personalizado: { ...NENHUM, ...s.personalizado }, sons: { ...PADRAO.sons, ...s.sons } };
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

export function preferencias(): Preferencias { return atual; }
export function mudarPreferencias(p: Partial<Preferencias>): void {
  atual = { ...atual, ...p };
  try { localStorage.setItem(CHAVE, JSON.stringify(atual)); } catch { /* sem armazenamento: vale até fechar a página */ }
  for (const f of ouvintes) f();
}
export function usePreferencias(): Preferencias {
  const [, forcar] = useState(0);
  useEffect(() => { const f = () => forcar((x) => x + 1); ouvintes.add(f); return () => { ouvintes.delete(f); }; }, []);
  return atual;
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
