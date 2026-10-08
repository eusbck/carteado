// Classifica rulings genéricos (repetidos em muitas cartas) por padrão de texto e imprime o bloco
// `rulings` pronto para a definição; os que não casam com nenhum padrão ficam marcados para
// conferência manual.
// Uso: node ferramentas/rulings-padrao.ts "Nome da Carta" ["Outra"...]

import { cartasPorNome, rulingsPorOracle } from '../servidor/catalogo/base.ts';

// ../cartas e as cartas novas dos decks importados (decks/cartas.json e decks/rulings.json)
const rulings = rulingsPorOracle();
const porNome = cartasPorNome();

export const PADROES: [RegExp, string][] = [
  // preparação (CR 722)
  [/^As an effect causes a creature with a prepare spell to become prepared/, 'teste: ao ficar preparado, cria a cópia do feitiço no exílio; conjurá-la tira a designação'],
  [/^If an effect causes a creature to become unprepared/, 'regra geral: CR 722.3b — sem a designação, a cópia no exílio deixa de existir (704.5e)'],
  [/^Preparation cards can only be cast with their base characteristics/, 'regra geral: CR 722.3 — a carta é conjurada só pela frente'],
  [/^Being prepared isn't a copiable value/, 'regra geral: CR 722.2b e 722.3a — preparado é designação do objeto, não valor copiável'],
  [/^While copies of spells in zones other than the stack cease to exist/, 'regra geral: CR 722.3c — exceção a 704.5e (motor/sba.ts)'],
  [/^If a prepared creature loses all abilities, it won't stop being prepared/, 'regra geral: CR 722.3a — preparado é designação, não habilidade'],
  [/^A spell's mana value is determined only by its mana cost/, 'regra geral: CR 202.3 — valor de mana só pelo custo de mana'],
  [/^A creature without a prepare spell can't become prepared/, 'regra geral: CR 722.3a — prepare() exige feitiço preparado'],
  [/^A creature with a prepare spell can't become prepared more than once/, 'regra geral: CR 722.3a — prepare() não age em quem já está preparado'],
  [/^If a prepare spell with one or more targets has no legal targets/, 'regra geral: CR 608.2b — não resolve; a designação já saiu ao conjurar (601.2i)'],
  [/^If an effect instructs you to choose a card name/, 'não se aplica: nenhuma carta dos decks pede para nomear uma carta'],
  [/^Creating a copy of a creature's prepare spell in exile ignores copy exceptions/, 'regra geral: CR 722.3c — a cópia usa só as características do feitiço preparado'],
  [/^A preparation card is a creature card in every zone/, 'regra geral: CR 722.4 — fora do campo, só as características normais'],
  [/^Casting a copy of a prepare spell from exile isn't casting it for an alternative cost/, 'regra geral: CR 722.3c — conjura pela permissão, pagando o custo normal'],
  [/^If a prepared creature stops being a creature, it will still be prepared/, 'regra geral: CR 722.3a — a designação continua'],
  [/^Only the current controller of a prepared creature can cast/, 'regra geral: CR 722.3c — só o controlador atual (motor/priority.ts)'],
  [/^To determine the total cost of a spell/, 'regra geral: CR 601.2f — custo total'],
  [/^If a card in a graveyard has \{X\} in its mana cost/, 'regra geral: CR 107.3g — X vale 0 fora da pilha'],
  [/resolves before the spell that caused it to trigger/, 'regra geral: CR 603.3 — o gatilho resolve antes da mágica'],
  [/^If you gain an amount of life "for each" of something/, 'regra geral: CR 119.9 — ganho "para cada" é um evento só'],
  [/^Each creature with lifelink dealing combat damage causes a separate life/, 'regra geral: CR 120.3 e 510.2 — cada fonte com vínculo com a vida é um evento'],
  [/^Once you've announced that you're casting a spell or activating an ability, players can't take actions/, 'regra geral: CR 601.2h — custos pagos sem respostas no meio'],
  [/^The creature you choose to put -1\/-1 counters on doesn't have to have enough toughness/, 'regra geral: CR 701.68 — pode escolher criatura que vai morrer'],
  [/^If you can't place -1\/-1 counters on any creatures you control/, 'regra geral: CR 701.68b — sem criatura, não dá para fazer blight'],
  [/^If a creature that has \+1\/\+1 counters on it receives enough -1\/-1 counters/, 'regra geral: CR 603.10a — a última informação vê todos os marcadores'],
  [/^All of the -1\/-1 counters must be put on a single creature/, 'regra geral: CR 701.68a — blight põe os marcadores numa criatura só'],
  [/^If a creature has \+1\/\+1 counters and -1\/-1 counters on it, state-based actions remove/, 'regra geral: CR 704.5q — marcadores +1/+1 e -1/-1 se anulam'],
  [/^A permanent card is an artifact, battle, creature, enchantment, land, or planeswalker card/, 'regra geral: CR 110.4a — isPermanentCard'],
  [/^Whenever a land you control enters, each landfall ability/, 'regra geral: CR 603.3b — o controlador ordena os próprios gatilhos'],
  [/^A landfall ability doesn't trigger if a permanent already on the battlefield becomes a land/, 'não se aplica: nenhuma carta dos decks transforma um permanente em terreno'],
  [/^A landfall ability triggers whenever a land you control enters for any reason/, 'regra geral: on.landfall olha qualquer entrada de terreno seu'],
  [/^In a Two-Headed Giant game/, 'não se aplica: Gigante de Duas Cabeças está fora do escopo'],
];

for (const nome of process.argv.slice(2)) {
  const c = porNome.get(nome);
  if (!c) { console.log(`?? ${nome}`); continue; }
  const lista = rulings[c.oracle_id] ?? [];
  console.log(`// ${nome}`);
  console.log('  rulings: {');
  lista.forEach((r, i) => {
    const p = PADROES.find(([re]) => re.test(r.comment));
    console.log(`    ${i + 1}: ${p ? JSON.stringify(p[1]) : `'CONFERIR: ${r.comment.slice(0, 90).replace(/'/g, '’')}'`},`);
  });
  console.log('  },');
}
