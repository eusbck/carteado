// Decks montados na própria mesa (a tela Montar deck): as cartas que dá para usar e a conferência da lista antes de
// gravar. Só entram cartas com regras no jogo (cartas/defs), então um deck montado já nasce jogável.
//
// O deck criado é um arquivo de decks/ como os outros, sem link do Moxfield e com `criado` (quem montou). O id
// começa com "c-" e nunca colide com um publicId do Moxfield (que não tem esse formato curto com hífen na frente).

import { randomBytes } from 'node:crypto';
import { registry } from '../../motor/defs.ts';
import { duplaValida, habilidadesDeParceiro, podeSerComandante } from '../../motor/deck.ts';
import { hasOracle, oracle, type OracleCard } from '../../motor/oracle.ts';
import type { CartaMontagem } from '../protocolo.ts';
import type { EntradaLista, Lista } from './tipos.ts';
import { validarLista } from './validar.ts';

/** nome de um deck montado: de 1 a 60 caracteres */
const TETO_NOME = 60;
/** teto de cartas diferentes (100 com básicos repetidos; sobra para o erro de contagem aparecer em vez de recusar) */
const TETO_CARTAS = 150;

export const novoIdCriado = () => `c-${randomBytes(9).toString('base64url')}`;
export const ehIdCriado = (id: string) => /^c-[A-Za-z0-9_-]{6,38}$/.test(id);

const basico = (c: OracleCard) => c.faces[0].supertypes.includes('Basic') && c.faces[0].types.includes('Land');
/** "A deck can have any number of cards named …" (Relentless Rats, Shadowborn Apostle…) */
const qualquerNumero = (c: OracleCard) => /a deck can have any number of cards named/i.test(c.faces.map((f) => f.oracleText).join('\n'));
/** "A deck can have up to seven cards named …" (Seven Dwarves): o teto; null sem limite próprio */
function tetoProprio(c: OracleCard): number | null {
  if (basico(c) || qualquerNumero(c)) return Infinity;
  const m = c.faces[0].oracleText.match(/a deck can have up to (\w+) cards named/i);
  const n = m ? ({ two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 } as Record<string, number>)[m[1].toLowerCase()] : undefined;
  return n ?? null;
}
const ehBackground = (c: OracleCard) => {
  const f = c.faces[0];
  return f.supertypes.includes('Legendary') && f.types.includes('Enchantment') && f.subtypes.includes('Background');
};

/**
 * As cartas que um deck montado pode ter: toda carta com regras no jogo (das listas de todos os decks, prontas ou em
 * preparação), sem as fichas. Para cada comandante possível, os parceiros com quem ele pode formar dupla.
 */
export function cartasParaMontar(pronta: (nome: string) => boolean): CartaMontagem[] {
  const cartas: OracleCard[] = [];
  for (const def of registry.cards.values()) {
    if (!hasOracle(def.name) || !pronta(def.name)) continue;
    cartas.push(oracle(def.name));
  }
  cartas.sort((a, b) => a.name.localeCompare(b.name));
  // candidatos a dupla: quem tem habilidade de parceiro e os Backgrounds
  const duplas = cartas.filter((c) => habilidadesDeParceiro(c).length > 0 || ehBackground(c));
  return cartas.map((c) => {
    const parceiros = habilidadesDeParceiro(c).length || ehBackground(c)
      ? duplas.filter((o) => o.name !== c.name && duplaValida(c, o)).map((o) => o.name)
      : [];
    const teto = tetoProprio(c);
    return {
      nome: c.name,
      custo: c.faces.map((f) => f.manaCostText ?? '').filter(Boolean).join(' // '),
      vm: c.manaValue,
      ci: c.colorIdentity,
      comandante: podeSerComandante(c),
      ...(parceiros.length ? { parceiros } : {}),
      ...(teto !== null ? { teto: teto === Infinity ? 0 : teto } : {}),
    };
  });
}

export interface PedidoCriado { nome: string; lista: Lista }

/** lê o corpo do pedido de gravar um deck montado; uma string com o erro se ele não serve */
export function lerPedido(dados: Record<string, unknown>): PedidoCriado | string {
  const nome = typeof dados.nome === 'string' ? dados.nome.replace(/\s+/g, ' ').trim() : '';
  if (!nome) return 'Dê um nome ao deck';
  if (nome.length > TETO_NOME) return `O nome do deck tem até ${TETO_NOME} caracteres`;
  const comandante = typeof dados.comandante === 'string' ? dados.comandante : '';
  if (!comandante) return 'Escolha o comandante';
  const parceiro = typeof dados.parceiro === 'string' && dados.parceiro ? dados.parceiro : undefined;
  if (!Array.isArray(dados.cartas)) return 'Pedido inválido';
  if (dados.cartas.length > TETO_CARTAS) return `O deck tem cartas demais (${dados.cartas.length} diferentes)`;
  const q = new Map<string, number>();
  for (const e of dados.cartas as unknown[]) {
    const x = e as Partial<EntradaLista> | null;
    if (!x || typeof x.nome !== 'string' || !Number.isInteger(x.quantidade) || (x.quantidade as number) < 1 || (x.quantidade as number) > 99) return 'Pedido inválido';
    q.set(x.nome, (q.get(x.nome) ?? 0) + (x.quantidade as number));
  }
  return { nome, lista: { comandante, ...(parceiro ? { parceiro } : {}), cartas: [...q].map(([n, quantidade]) => ({ nome: n, quantidade })) } };
}

/**
 * Confere a lista: toda carta existe e tem regras, e as regras de deck de Commander (CR 903.3 e 903.5), com as
 * exceções de cópias que a própria carta dá ("any number of cards named", "up to seven").
 */
export function conferirCriado(l: Lista, pronta: (nome: string) => boolean, banidas?: Set<string>): { erros: string[]; avisos: string[] } {
  const nomes = [...(l.comandante ? [l.comandante] : []), ...(l.parceiro ? [l.parceiro] : []), ...l.cartas.map((c) => c.nome)];
  const faltam = [...new Set(nomes)].filter((n) => !hasOracle(n) || !pronta(n));
  if (faltam.length) return { erros: faltam.map((n) => `${n} não está entre as cartas do jogo`), avisos: [] };
  const { erros, avisos } = validarLista(l, oracle, { banidas });
  // validateDeck só conhece os básicos como exceção à regra de uma cópia (903.5b): as cartas que dizem quantas
  // cópias o deck pode ter valem pelo próprio texto
  const q = new Map(l.cartas.map((c) => [c.nome, c.quantidade]));
  const fora = erros.filter((e) => {
    const m = e.match(/^(.+) aparece (\d+) vezes — CR 903\.5b$/);
    if (!m) return true;
    const teto = tetoProprio(oracle(m[1]));
    return teto === null || (teto !== Infinity && (q.get(m[1]) ?? 0) > teto);
  });
  return { erros: fora, avisos };
}
