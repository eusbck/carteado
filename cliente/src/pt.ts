// Nomes em português para o que vem do motor em inglês (palavras-chave, tipos, etapas).

import type { Step } from '../../motor/types.ts';

const PALAVRAS: Record<string, string> = {
  flying: 'voar', haste: 'ímpeto', vigilance: 'vigilância', reach: 'alcance', deathtouch: 'toque mortífero',
  lifelink: 'vínculo com a vida', defender: 'defensor', 'first strike': 'primeiro golpe', 'double strike': 'golpe duplo',
  trample: 'atropelar', menace: 'ameaçar', hexproof: 'resistência a magia', indestructible: 'indestrutível', flash: 'lampejo',
  protection: 'proteção', decayed: 'decaimento', devoid: 'vácuo', ward: 'resguardo', partner: 'parceiro', equip: 'equipar',
  cycling: 'ciclagem', flashback: 'recapitular', escape: 'fuga', shroud: 'manto', fear: 'medo', intimidate: 'intimidar',
  infect: 'infectar', wither: 'murchar', prowess: 'destreza', changeling: 'polimorfo', convoke: 'convocar', landwalk: 'travessia',
  explore: 'explorar', toxic: 'tóxico', gift: 'presente', impending: 'iminente', undaunted: 'destemido', eminence: 'eminência',
  plainscycling: 'ciclagem de planície', 'basic landcycling': 'ciclagem de terreno básico', transform: 'transformar',
  surveil: 'vigiar',
};

export function palavraChave(k: string): string {
  return PALAVRAS[k] ?? k;
}

const TIPOS: Record<string, string> = {
  Creature: 'criatura', Land: 'terreno', Artifact: 'artefato', Enchantment: 'encantamento', Planeswalker: 'planeswalker',
  Instant: 'instantânea', Sorcery: 'feitiço', Battle: 'batalha', Kindred: 'tribal',
};
export function tipo(t: string): string {
  return TIPOS[t] ?? t;
}

export const ETAPAS: { id: Step; nome: string; curto: string }[] = [
  { id: 'untap', nome: 'Desvirar', curto: 'Desvirar' }, { id: 'upkeep', nome: 'Manutenção', curto: 'Manutenção' }, { id: 'draw', nome: 'Compra', curto: 'Compra' },
  { id: 'main1', nome: 'Fase principal pré-combate', curto: 'Principal' },
  { id: 'beginCombat', nome: 'Início do combate', curto: 'Início' }, { id: 'declareAttackers', nome: 'Declarar atacantes', curto: 'Atacantes' },
  { id: 'declareBlockers', nome: 'Declarar bloqueadores', curto: 'Bloqueadores' }, { id: 'firstStrikeDamage', nome: 'Dano de primeiro golpe', curto: '1º golpe' },
  { id: 'combatDamage', nome: 'Dano de combate', curto: 'Dano' }, { id: 'endCombat', nome: 'Fim do combate', curto: 'Fim' },
  { id: 'main2', nome: 'Fase principal pós-combate', curto: 'Principal' },
  { id: 'end', nome: 'Etapa final', curto: 'Etapa final' }, { id: 'cleanup', nome: 'Limpeza', curto: 'Limpeza' },
];

/** as cinco fases do turno (CR 500.1) e as etapas de cada uma */
export const FASES: { id: string; nome: string; curto: string; etapas: Step[] }[] = [
  { id: 'inicial', nome: 'Fase Inicial', curto: 'Inicial', etapas: ['untap', 'upkeep', 'draw'] },
  { id: 'principal1', nome: 'Fase Principal Pré-Combate', curto: 'Pré-combate', etapas: ['main1'] },
  { id: 'combate', nome: 'Fase de Combate', curto: 'Combate', etapas: ['beginCombat', 'declareAttackers', 'declareBlockers', 'firstStrikeDamage', 'combatDamage', 'endCombat'] },
  { id: 'principal2', nome: 'Fase Principal Pós-Combate', curto: 'Pós-combate', etapas: ['main2'] },
  { id: 'final', nome: 'Fase Final', curto: 'Final', etapas: ['end', 'cleanup'] },
];
