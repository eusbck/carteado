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
  surveil: 'vigiar', cantBlock: 'não pode bloquear',
};

export function palavraChave(k: string): string {
  return PALAVRAS[k] ?? k;
}

const TIPOS: Record<string, string> = {
  Creature: 'criatura', Land: 'terreno', Artifact: 'artefato', Enchantment: 'encantamento', Planeswalker: 'planeswalker',
  Instant: 'mágica instantânea', Sorcery: 'feitiço', Battle: 'batalha', Kindred: 'tribal',
};
export function tipo(t: string): string {
  return TIPOS[t] ?? t;
}

// supertipos e subtipos com o nome das impressões em português (o rascunho saiu das cartas que têm as duas linhas de
// tipo, revisto à mão; os que nenhuma carta em português trazia seguem a tradução oficial de outras coleções). O
// adjetivo vem nas duas formas porque concorda com o tipo: "Criatura Lendária", "Artefato Lendário".
const OUTROS_TIPOS: Record<string, string> = {
  Basic: 'básico básica', Legendary: 'lendário lendária', Snow: 'da neve', World: 'mundial', Token: 'ficha',
  // terrenos
  Plains: 'planície', Island: 'ilha', Swamp: 'pântano', Mountain: 'montanha', Forest: 'floresta', Desert: 'deserto',
  Gate: 'portão', Urza: 'urza',
  // artefatos, encantamentos e mágicas
  Equipment: 'equipamento', Vehicle: 'veículo', Food: 'comida', Treasure: 'tesouro', Clue: 'pista', Map: 'mapa',
  Aura: 'aura', Saga: 'saga', Class: 'classe', Room: 'cômodo', Arcane: 'arcano arcana', Plan: 'plano',
  // criaturas
  Advisor: 'conselheiro', Aetherborn: 'etergênito', Alien: 'alienígena', Ally: 'aliado', Angel: 'anjo', Archon: 'arconte',
  Army: 'exército', Artificer: 'artesão artífice', Assassin: 'assassino', Avatar: 'avatar', Barbarian: 'bárbaro', Bard: 'bardo',
  Beast: 'fera besta', Berserker: 'berserker', Bird: 'ave pássaro', Boar: 'javali', Cat: 'felino gato',
  Citizen: 'cidadão', Cleric: 'clérigo', Construct: 'constructo', Crocodile: 'crocodilo', Demon: 'demônio',
  Detective: 'detetive', Devil: 'diabo', Dinosaur: 'dinossauro', Djinn: 'djinn gênio', Doctor: 'doutor', Dog: 'cão cachorro',
  Dragon: 'dragão', Drake: 'dragonete', Druid: 'druida', Dryad: 'dríade', Dwarf: 'anão', Efreet: 'efrite', Elder: 'ancião',
  Eldrazi: 'eldrazi', Elemental: 'elemental', Elephant: 'elefante', Elf: 'elfo', Faerie: 'fada', Fish: 'peixe',
  Fox: 'raposa', Frog: 'sapo', Fungus: 'fungo', Gamma: 'gama', Gargoyle: 'gárgula', Germ: 'germe', Giant: 'gigante', Goat: 'bode cabra',
  Goblin: 'goblin', God: 'deus', Golem: 'golem', Griffin: 'grifo', Halfling: 'pequenino', Hero: 'herói', Horror: 'horror',
  Horse: 'cavalo', Human: 'humano', Hydra: 'hidra', Illusion: 'ilusão', Incarnation: 'encarnação', Incubator: 'incubadora',
  Inhuman: 'inumano', Insect: 'inseto', Knight: 'cavaleiro', Kobold: 'kobold', Kor: 'kor', Kraken: 'kraken',
  Lizard: 'lagarto', Mercenary: 'mercenário', Merfolk: 'tritão', Mite: 'ácaro', Monk: 'monge', Monkey: 'macaco',
  Mutant: 'mutante', Myr: 'myr', Nightmare: 'pesadelo', Ninja: 'ninja', Noble: 'nobre', Ooze: 'lodo', Orc: 'orc',
  Otter: 'lontra', Ouphe: 'trasgo', Ox: 'boi', Pegasus: 'pégaso', Pest: 'peste praga', Phoenix: 'fênix', Phyrexian: 'phyrexiano',
  Pirate: 'pirata', Plant: 'planta', Praetor: 'pretor', Rat: 'rato', Rebel: 'rebelde', Rhino: 'rinoceronte', Robot: 'robô',
  Rogue: 'ladino', Samurai: 'samurai', Saproling: 'saprolita', Satyr: 'sátiro', Scarecrow: 'espantalho', Scientist: 'cientista', Scout: 'batedor',
  Shaman: 'xamã', Shapeshifter: 'metamorfo', Shark: 'tubarão', Sheep: 'ovelha', Skeleton: 'esqueleto', Sloth: 'preguiça',
  Snake: 'cobra serpente', Soldier: 'soldado', Sorcerer: 'feiticeiro', Spawn: 'cria', Sphinx: 'esfinge', Spider: 'aranha',
  Spirit: 'espírito', Spy: 'espião', Tiefling: 'tiferino', Treefolk: 'ent árvore', Troll: 'trol', Turtle: 'tartaruga',
  Unicorn: 'unicórnio', Vampire: 'vampiro', Villain: 'vilão', Wall: 'barreira muralha', Warlock: 'bruxo',
  Warrior: 'guerreiro', Wizard: 'mago', Wolf: 'lobo', Worm: 'verme', Wraith: 'aparição', Wurm: 'vorme', Zombie: 'zumbi',
};

/** as palavras em português da linha de tipo em inglês ("Basic Land — Mountain" → "básico básica terreno montanha"),
 * para a busca achar também as cartas sem impressão em português; palavra sem tradução fica de fora */
export function palavrasDoTipo(linha: string): string {
  return linha.split(/[^A-Za-z]+/).map((w) => TIPOS[w] ?? OUTROS_TIPOS[w]).filter(Boolean).join(' ');
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
