// Classifica os rulings dos terrenos gerados pelo rascunho, por padrões de texto que se
// repetem em cada ciclo. Escreve .cache/rulings-terrenos.json (para gravar-rulings.ts) e
// lista os que não casaram, para revisão manual.

import '../cartas/index.ts';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cartasPorNome, rulingsPorOracle } from '../servidor/catalogo/base.ts';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
// ../cartas e as cartas novas dos decks importados (decks/cartas.json e decks/rulings.json)
const rulings = rulingsPorOracle();
const byName = cartasPorNome();

const PADROES: [RegExp, string][] = [
  [/not counted when determining if this land enters the battlefield tapped/i, 'regra geral: CR 614.12 — a condição é checada antes de qualquer terreno entrar junto (putOntoBattlefield avalia as substituições antes de mover)'],
  [/not basic lands because "basic" doesn't appear/i, 'regra geral: CR 305.8 — só terrenos com o supertipo básico contam (land.tappedUnlessBasics filtra por supertypes)'],
  [/because these cards have basic land types, effects that specify a basic land type/i, 'regra geral: CR 305.6 e 305.8 — tem os tipos básicos sem ser básico (gerado/cartas.json; filtros por tipo e por "basic" são separados)'],
  [/has two basic land types\. It('|’)s not basic/i, 'regra geral: CR 305.8 — tem dois tipos básicos e não é básico; fetchs só acham básicos (isBasicLand)'],
  [/checks for lands that are already on the battlefield/i, 'regra geral: CR 614.12 — só vê terrenos que já estão no campo'],
  [/checks for lands you control with the land type/i, 'teste: entra desvirado com o tipo de terreno (qualquer terreno com o subtipo, básico ou não)'],
  [/is entering the battlefield from your hand at the same time as/i, 'não se aplica: nenhuma carta dos decks põe dois terrenos da mão no campo ao mesmo tempo'],
  [/You may reveal any land card with either or both of the appropriate subtypes/i, 'regra geral: qualquer carta da mão com um dos subtipos serve (land.snarl filtra por subtipo, não por básico)'],
  [/Lands don('|’)t have a subtype just because they can produce mana/i, 'regra geral: o snarl não tem subtipos; a revelação filtra por subtipo (land.snarl)'],
  [/The "Snarl" itself doesn('|’)t have any land subtypes/i, 'regra geral: o snarl não tem subtipos; a revelação filtra por subtipo (land.snarl)'],
  [/If an effect instructs you to put .* onto the battlefield tapped, it will still enter the battlefield tapped/i, 'regra geral: a substituição do snarl só vira o terreno, nunca o desvira (asEnters só põe tapped = true)'],
  [/each land in this cycle is colorless\. The damage dealt to you is dealt by a colorless source/i, 'não se aplica: nenhuma carta dos decks depende da cor da fonte desse dano'],
  [/damage dealt to you is part of the second mana ability\. It doesn('|’)t use the stack/i, 'teste: CR 120.3a: a mana colorida causa 1 de dano a você; {C} não (sem pilha, CR 605.3b)'],
  [/enters the battlefield and you control no other lands, its ability will force you to return it/i, 'regra geral: a escolha inclui o próprio terreno (land.bounceLand lista todos os seus terrenos)'],
  [/You choose how to order cards returned to your library after scrying/i, 'regra geral: CR 701.22a — a decisão de vidência ordena o topo e o fundo (lookAndArrange)'],
  [/You perform the actions stated on a card in sequence/i, 'regra geral: CR 608.2c — instruções em ordem'],
  [/Scry appears on some spells and abilities with one or more targets/i, 'não se aplica: a vidência destes terrenos não tem alvos'],
  [/When you scry, you may put all the cards you look at back on top/i, 'regra geral: CR 701.22a — cada carta vai para o topo ou o fundo à escolha (lookAndArrange)'],
  [/\{\(b\/r\)\}, \{T\}" is the same as saying/i, 'teste: CR 605: mana que produz (custo híbrido pago com qualquer das cores, CR 107.4e)'],
  [/is the same as saying "\{.\}, \{T\} or/i, 'teste: CR 605: mana que produz (custo híbrido pago com qualquer das cores, CR 107.4e)'],
  [/enters the battlefield at the same time as any number of other lands, those other lands are not counted/i, 'regra geral: CR 614.12 — a condição é checada antes de qualquer terreno entrar junto'],
  [/lands your opponents control/i, 'regra geral: CR 614.12 — conta os terrenos dos oponentes já no campo'],
  [/If you control three or more other Islands/i, 'teste: entra virado sem três outras Islands'],
];

const out: Record<string, Record<string, string>> = {};
const faltam: string[] = [];
const defs = readdirSync(join(raiz, 'cartas', 'defs')).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));
for (const f of defs) {
  const txt = readFileSync(join(raiz, 'cartas', 'defs', f), 'utf8');
  if (!txt.includes('gerado por ferramentas/rascunho.ts')) continue;
  const nome = JSON.parse(txt.match(/name: (".*?")/)![1]) as string;
  const list = rulings[byName.get(nome)!.oracle_id] ?? [];
  if (list.length === 0) { out[nome] = {}; continue; }
  const r: Record<string, string> = {};
  list.forEach((x, i) => {
    const p = PADROES.find(([re]) => re.test(x.comment));
    if (p) r[String(i + 1)] = p[1];
    else faltam.push(`${nome} #${i + 1}: ${x.comment}`);
  });
  out[nome] = r;
}
writeFileSync(join(raiz, '.cache', 'rulings-terrenos.json'), JSON.stringify(out, null, 1));
console.log(`${Object.keys(out).length} terrenos; sem padrão: ${faltam.length}`);
for (const x of faltam) console.log(x);
