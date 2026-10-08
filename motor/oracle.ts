// Dados Oracle das cartas (gerado/cartas.json) e características impressas de cada face.

import dados from '../gerado/cartas.json' with { type: 'json' };
import { colorsOfCost, manaValueOf, parseCost } from './mana.ts';
import type { Color, ManaSymbol } from './types.ts';

export interface OracleFace {
  name: string;
  manaCostText: string;
  manaCost: ManaSymbol[] | null;
  typeLine: string;
  supertypes: string[];
  types: string[];
  subtypes: string[];
  oracleText: string;
  power: number | null;
  toughness: number | null;
  /** P/T definidos por habilidade (*), CR 604.3 */
  ptStar: boolean;
  loyalty: number | null;
  colors: Color[];
}

export interface OracleCard {
  name: string;
  oracleId: string;
  layout: string;
  manaValue: number;
  colorIdentity: Color[];
  keywords: string[];
  faces: OracleFace[];
}

export interface RawFace {
  name: string; manaCost: string; typeLine: string; supertypes: string[]; types: string[]; subtypes: string[];
  oracleText: string; power: number | string | null; toughness: number | string | null; loyalty: number | string | null;
  colors: string[]; colorIndicator: string[] | null;
}
export interface RawCard { name: string; oracleId: string; layout: string; manaValue: number; colorIdentity: string[]; keywords: string[]; faces: RawFace[] }

const raw = dados as unknown as { cartas: Record<string, RawCard>; fichas: (RawCard & { imagem: unknown })[] };

function face(f: RawFace, layout: string, devoid = false): OracleFace {
  const manaCost = f.manaCost ? parseCost(f.manaCost) : null;
  // ficha: as cores vêm do efeito que a cria (CR 111.4), registradas nos dados da ficha impressa
  // devoid: "este objeto é incolor", em todas as zonas (CR 702.114a)
  const colors = (devoid ? [] : layout === 'token' ? f.colors : f.colorIndicator?.length ? f.colorIndicator : colorsOfCost(manaCost)) as Color[];
  const num = (v: number | string | null) => (typeof v === 'number' ? v : null);
  return {
    name: f.name,
    manaCostText: f.manaCost,
    manaCost: f.manaCost ? manaCost : (layout === 'token' ? null : null),
    typeLine: f.typeLine,
    supertypes: f.supertypes,
    types: f.types,
    subtypes: f.subtypes,
    oracleText: f.oracleText,
    power: num(f.power),
    toughness: num(f.toughness),
    ptStar: typeof f.power === 'string' || typeof f.toughness === 'string',
    loyalty: num(f.loyalty),
    colors,
  };
}

function convert(c: RawCard): OracleCard {
  return {
    name: c.name, oracleId: c.oracleId, layout: c.layout, manaValue: c.manaValue,
    colorIdentity: c.colorIdentity as Color[], keywords: c.keywords,
    faces: c.faces.map((f) => face(f, c.layout, c.keywords.includes('Devoid'))),
  };
}

/** dados de uma carta no formato de gerado/cartas.json, convertidos (importação de decks) */
export const oracleDeDados = convert;

const cartas = new Map<string, OracleCard>();
for (const [nome, c] of Object.entries(raw.cartas)) cartas.set(nome, convert(c));
export const fichasOracle: OracleCard[] = raw.fichas.map(convert);

export function oracle(name: string): OracleCard {
  const c = cartas.get(name);
  if (!c) throw new Error(`Carta não encontrada nos dados Oracle: ${name}`);
  return c;
}

export function hasOracle(name: string): boolean {
  return cartas.has(name);
}

export function allOracleNames(): string[] {
  return [...cartas.keys()];
}

/** valor de mana impresso de uma face (para faces de trás de cartas que transformam, usa-se a frente: CR 712.8e) */
export function faceManaValue(card: OracleCard, faceIndex: number): number {
  if (card.layout === 'transform' && faceIndex > 0) return manaValueOf(card.faces[0].manaCost);
  return manaValueOf(card.faces[faceIndex]?.manaCost ?? null);
}

export const BASIC_LAND_MANA: Record<string, Color> = { Plains: 'W', Island: 'U', Swamp: 'B', Mountain: 'R', Forest: 'G' };

/** layout da carta nos dados Oracle ('normal', 'transform', 'prepare'…); null para fichas */
export function oracleLayout(name: string): string | null {
  return cartas.get(name)?.layout ?? null;
}

/** subtipos que não são tipos de criatura: de artefato, encantamento, terreno e mágica (CR 205.3g-i, 205.3k) */
export const NON_CREATURE_SUBTYPES: Set<string> = new Set([
  'Attraction', 'Blood', 'Bobblehead', 'Book', 'Clue', 'Contraption', 'Equipment', 'Food', 'Fortification', 'Gold', 'Heartwood', 'Incubator',
  'Infinity', 'Junk', 'Lander', 'Map', 'Mutagen', 'Powerstone', 'Spacecraft', 'Stone', 'Treasure', 'Vehicle', 'Vibranium',
  'Aura', 'Background', 'Cartouche', 'Case', 'Class', 'Curse', 'Plan', 'Role', 'Room', 'Rune', 'Saga', 'Shard', 'Shrine',
  'Cave', 'Desert', 'Forest', 'Gate', 'Island', 'Lair', 'Locus', 'Mine', 'Mountain', 'Plains', 'Planet', 'Power-Plant', 'Sphere', 'Swamp', 'Tower', 'Town', "Urza's",
  'Adventure', 'Arcane', 'Lesson', 'Omen', 'Trap',
]);

/** subtipos que são tipos de criatura (CR 205.3m), tirados das faces de criatura e kindred dos dados (uma face
 *  "Kindred Enchantment — Eldrazi Aura" ou uma Saga criatura também têm subtipos de encantamento: ficam de fora) */
export const CREATURE_SUBTYPES: Set<string> = new Set(
  [...cartas.values(), ...fichasOracle].flatMap((c) => c.faces.filter((f) => f.types.includes('Creature') || f.types.includes('Kindred')).flatMap((f) => f.subtypes))
    .filter((st) => !NON_CREATURE_SUBTYPES.has(st)),
);
