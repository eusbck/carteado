// Nomes em português para o que vem do motor em inglês (palavras-chave, tipos, etapas).

const PALAVRAS: Record<string, string> = {
  flying: 'voar', haste: 'ímpeto', vigilance: 'vigilância', reach: 'alcance', deathtouch: 'toque mortífero',
  lifelink: 'vínculo com a vida', defender: 'defensor', 'first strike': 'primeiro golpe', 'double strike': 'golpe duplo',
  trample: 'atropelar', menace: 'ameaçar', hexproof: 'resistência a magia', indestructible: 'indestrutível', flash: 'lampejo',
  protection: 'proteção', decayed: 'decaimento', devoid: 'vácuo', ward: 'resguardo', partner: 'parceiro', equip: 'equipar',
  cycling: 'ciclagem', flashback: 'recapitular', escape: 'fuga', shroud: 'manto', fear: 'medo', intimidate: 'intimidar',
  infect: 'infectar', wither: 'murchar', prowess: 'destreza', changeling: 'polimorfo', convoke: 'convocar', landwalk: 'travessia',
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

export const ETAPAS: { id: string; nome: string }[] = [
  { id: 'untap', nome: 'Desvirar' }, { id: 'upkeep', nome: 'Manutenção' }, { id: 'draw', nome: 'Compra' },
  { id: 'main1', nome: 'Principal 1' }, { id: 'beginCombat', nome: 'Início do combate' }, { id: 'declareAttackers', nome: 'Atacantes' },
  { id: 'declareBlockers', nome: 'Bloqueadores' }, { id: 'firstStrikeDamage', nome: 'Primeiro golpe' }, { id: 'combatDamage', nome: 'Dano' },
  { id: 'endCombat', nome: 'Fim do combate' }, { id: 'main2', nome: 'Principal 2' }, { id: 'end', nome: 'Final' }, { id: 'cleanup', nome: 'Limpeza' },
];
