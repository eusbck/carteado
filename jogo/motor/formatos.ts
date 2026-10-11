// Formatos de carta com mais de um conjunto de características: modal de duas faces (CR 712.3, 712.8f, 712.11b,
// 712.12), dividida com fusão e aftermath (709, 702.102, 702.127), Sala (709.5), aventura (715) e reversível.
// Aqui ficam só as perguntas sobre os dados Oracle (que faces existem, quais se conjuram de onde, qual vale em cada
// zona); conjurar e jogar ficam em stack.ts e priority.ts, as características em chars.ts.
//
// A face de um objeto fica em GameObject.face. Na pilha e no campo ela diz qual face está para cima (modal de duas
// faces, transformar) ou qual metade foi conjurada (dividida, aventura). Duas faces "virtuais" completam o quadro:
// FACE_AMBAS (as duas metades juntas) e FACE_NENHUMA (Sala sem porta destrancada).

import { oracle, oracleLayout } from './oracle.ts';
import type { ZoneName } from './types.ts';

/** as duas metades juntas: dividida fora da pilha (CR 709.4), mágica fundida (702.102b, 709.4d) e Sala com as duas
 *  portas destrancadas (709.5) */
export const FACE_AMBAS = 2;
/** Sala no campo sem nenhuma porta destrancada (CR 709.5d): sem nome, custo nem habilidades (ruling 14) */
export const FACE_NENHUMA = 3;

/** layouts que o motor sabe jogar (gerado/cartas.json, campo layout do Scryfall) */
export const LAYOUTS_SUPORTADOS: ReadonlySet<string> = new Set([
  'normal', 'transform', 'prepare', 'class', 'saga', 'modal_dfc', 'split', 'adventure', 'reversible_card',
]);

const PERMANENTES = ['Artifact', 'Battle', 'Creature', 'Enchantment', 'Land', 'Planeswalker'];

/** modal de duas faces (CR 712.3) */
export const ehModal = (def: string): boolean => oracleLayout(def) === 'modal_dfc';
/** carta dividida (CR 709), Salas incluídas */
export const ehDividida = (def: string): boolean => oracleLayout(def) === 'split';
/** carta de aventureiro (CR 715) */
export const ehAventura = (def: string): boolean => oracleLayout(def) === 'adventure';
/** carta reversível: as duas faces são iguais e vale a da frente (o CR não trata delas) */
export const ehReversivel = (def: string): boolean => oracleLayout(def) === 'reversible_card';

/** formatos em que a pessoa escolhe a face ao conjurar ou jogar */
export function temVariasFaces(def: string): boolean {
  const l = oracleLayout(def);
  return l === 'modal_dfc' || l === 'split' || l === 'adventure';
}

/** carta dividida de permanente com uma linha de tipo compartilhada (CR 709.5): as Salas */
export function ehSala(def: string): boolean {
  return ehDividida(def) && oracle(def).faces[0].types.some((t) => PERMANENTES.includes(t));
}

/** dividida com fusão (CR 702.102a) */
export function temFusao(def: string): boolean {
  return ehDividida(def) && oracle(def).keywords.includes('Fuse');
}

/** a metade com aftermath (CR 702.127a), a que só se conjura do cemitério; null se a carta não tem */
export function metadeAftermath(def: string): number | null {
  if (!ehDividida(def)) return null;
  const i = oracle(def).faces.findIndex((f) => /^Aftermath\b/m.test(f.oracleText));
  return i >= 0 ? i : null;
}

/** nome de uma face (ou das duas metades juntas, "Dusk // Dawn"); vazio para a Sala sem porta destrancada */
export function nomeDaFace(def: string, face: number): string {
  const c = oracle(def);
  if (face === FACE_NENHUMA) return '';
  if (face === FACE_AMBAS) return c.faces.map((f) => f.name).join(' // ');
  return (c.faces[face] ?? c.faces[0]).name;
}

const ehTerreno = (def: string, face: number) => (oracle(def).faces[face]?.types ?? []).includes('Land');

/**
 * Faces que podem ser conjuradas a partir da zona (só o formato; tempo, custo e alvos ficam para quem conjura):
 * - modal de duas faces: cada face que não é terreno (CR 712.11b, 305.9);
 * - dividida: cada metade (709.3), menos a com aftermath fora do cemitério (702.127a; ruling 7); as duas juntas
 *   (FACE_AMBAS) com fusão, da mão (702.102a);
 * - aventura: a carta normal e a aventura (715.3);
 * - as outras: a face da frente, se não for terreno.
 */
export function facesConjuraveis(def: string, zona: ZoneName): number[] {
  const l = oracleLayout(def);
  if (l === 'modal_dfc') return [0, 1].filter((f) => oracle(def).faces[f] && !ehTerreno(def, f));
  if (l === 'split') {
    const af = metadeAftermath(def);
    const out = [0, 1].filter((f) => f !== af || zona === 'graveyard');
    if (temFusao(def) && zona === 'hand') out.push(FACE_AMBAS);
    return out;
  }
  if (l === 'adventure') return [0, 1];
  return l !== null && ehTerreno(def, 0) ? [] : [0];
}

/** faces que podem ser jogadas como terreno: a do modal de duas faces que é terreno (CR 712.12) */
export function facesDeTerreno(def: string): number[] {
  if (ehModal(def)) return [0, 1].filter((f) => ehTerreno(def, f));
  return oracleLayout(def) !== null && ehTerreno(def, 0) ? [0] : [];
}

/** chave da ação para uma face ('hand', 'hand@1', 'perm:x@1'); a face 0 fica com a chave de sempre */
export function chaveComFace(chave: string, face: number): string {
  return face === 0 ? chave : `${chave}@${face}`;
}

/** separa a face da chave de uma ação de jogar ('hand@1' → ['hand', 1]) */
export function faceDaChave(chave: string): [string, number] {
  const m = /^(.*)@(\d+)$/.exec(chave);
  return m ? [m[1], Number(m[2])] : [chave, 0];
}

/** "Conjurar Locthwain Scorn (aventura)", "Conjurar Double Jump e Flying Kick (fusão)" */
export function rotuloConjurar(def: string, face: number, verbo = 'Conjurar'): string {
  if (face === FACE_AMBAS) return `${verbo} ${oracle(def).faces.map((f) => f.name).join(' e ')} (fusão)`;
  const nome = nomeDaFace(def, face);
  return ehAventura(def) && face === 1 ? `${verbo} ${nome} (aventura)` : `${verbo} ${nome}`;
}
