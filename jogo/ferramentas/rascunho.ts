// Rascunho automático de cartas formulaicas (hoje: terrenos). Para cada carta ainda sem
// definição em cartas/defs, tenta traduzir todas as linhas do Oracle por padrões conhecidos.
// Se todas casarem, escreve cartas/defs/<slug>.ts e cartas/defs/<slug>.test.ts.
// Uso: node ferramentas/rascunho.ts [--dry]

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const dados = JSON.parse(readFileSync(join(raiz, 'gerado', 'cartas.json'), 'utf8')).cartas as Record<string, { name: string; faces: { typeLine: string; types: string[]; subtypes: string[]; oracleText: string }[] }>;
const dry = process.argv.includes('--dry');

import { slug } from './slug.ts';
export { slug };
function slugLocal(name: string): string {
  return name.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const BASIC: Record<string, string> = { Plains: 'W', Island: 'U', Swamp: 'B', Mountain: 'R', Forest: 'G' };

interface Out { code: string[]; tests: string[]; mana: string[]; uses: Set<string> }

type Rule = [RegExp, (m: RegExpMatchArray, o: Out, name: string, subtypes: string[]) => void];

/** fontes de mana (terrenos básicos e Sol Ring) que pagam um custo, para os testes */
function sources(cost: string): string {
  const LAND: Record<string, string> = { W: 'Plains', U: 'Island', B: 'Swamp', R: 'Mountain', G: 'Forest' };
  const out: string[] = [];
  for (const m of cost.matchAll(/\{([^}]+)\}/g)) {
    if (/^\d+$/.test(m[1])) for (let i = 0; i < Number(m[1]); i++) out.push('Wastes?');
    else out.push(LAND[m[1]]);
  }
  const generic = out.filter((x) => x === 'Wastes?').length;
  const rest = out.filter((x) => x !== 'Wastes?');
  for (let i = 0; i < Math.ceil(generic / 2); i++) rest.push('Sol Ring');
  return rest.map((x) => `'${x}'`).join(', ');
}

const RULES: Rule[] = [
  [/^\(\{T\}: Add \{(\w)\}( or \{(\w)\})?\.\)$/, (m, o) => { o.mana.push(m[1]); if (m[3]) o.mana.push(m[3]); }],
  [/^\{T\}: Add \{(\w)\}\.$/, (m, o) => { o.code.push(`mana('${m[1]}')`); o.mana.push(m[1]); }],
  [/^\{T\}: Add \{(\w)\}\{(\w)\}\.$/, (m, o) => { o.code.push(`mana('${m[1]}${m[2]}')`); o.mana.push(m[1] + m[2]); }],
  [/^\{T\}: Add \{(\w)\} or \{(\w)\}\.$/, (m, o) => { o.code.push(`mana(['${m[1]}', '${m[2]}'])`); o.mana.push(m[1], m[2]); }],
  [/^\{T\}: Add \{(\w)\}, \{(\w)\}, or \{(\w)\}\.$/, (m, o) => { o.code.push(`mana(['${m[1]}', '${m[2]}', '${m[3]}'])`); o.mana.push(m[1], m[2], m[3]); }],
  [/^\{1\}, \{T\}: Add \{(\w)\}\{(\w)\}\.$/, (m, o) => { o.code.push(`mana('${m[1]}${m[2]}', { cost: '{1}, {T}' })`); o.mana.push(m[1] + m[2]); }],
  [/^\{(\w)\/(\w)\}, \{T\}: Add \{\1\}\{\1\}, \{\1\}\{\2\}, or \{\2\}\{\2\}\.$/, (m, o) => { o.code.push(`land.filter('${m[1]}', '${m[2]}')`); o.mana.push(m[1] + m[1], m[1] + m[2], m[2] + m[2]); }],
  [/^\{T\}: Add \{(\w)\} or \{(\w)\}\. This land deals 1 damage to you\.$/, (m, o) => {
    o.code.push(`land.pain(['${m[1]}', '${m[2]}'])`); o.mana.push(m[1], m[2]);
    o.tests.push(`  it('CR 120.3a: a mana colorida causa 1 de dano a você; {C} não', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    const acts = tg.actionIds().filter((a) => a.startsWith('mana:'));
    const colorida = acts.find((a) => a.endsWith('|1'))!;
    tg.answer({ kind: 'priority', action: colorida });
    expect(tg.life(0)).toBe(39);
  });`);
  }],
  [/^\{T\}: Add one mana of any color\.$/, (_m, o) => { o.code.push(`mana('any')`); o.mana.push('B', 'G', 'R', 'U', 'W'); }],
  [/^This land enters tapped\.$/, (_m, o) => {
    o.code.push('land.tapped()');
    o.tests.push(`  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));`);
  }],
  [/^This land enters tapped unless you control two or more basic lands\.$/, (_m, o) => {
    o.code.push('land.tappedUnlessBasics(2)');
    o.tests.push(`  it('entra virado com menos de dois terrenos básicos', () => expect(entraVirado(NOME, ['Forest'])).toBe(true));
  it('entra desvirado com dois terrenos básicos', () => expect(entraVirado(NOME, ['Forest', 'Swamp'])).toBe(false));`);
  }],
  [/^This land enters tapped unless you control an? (\w+) or an? (\w+)\.$/, (m, o) => {
    o.code.push(`land.tappedUnlessControl('${m[1]}', '${m[2]}')`);
    o.tests.push(`  it('entra virado sem ${m[1]} nem ${m[2]}', () => expect(entraVirado(NOME, ['Sol Ring'])).toBe(true));
  it('entra desvirado com ${m[1]}', () => expect(entraVirado(NOME, ['${m[1]}'])).toBe(false));
  it('entra desvirado com ${m[2]}', () => expect(entraVirado(NOME, ['${m[2]}'])).toBe(false));`);
  }],
  [/^This land enters tapped unless you control two or more other lands\.$/, (_m, o) => {
    o.code.push('land.tappedUnlessOtherLands(2)');
    o.tests.push(`  it('entra virado com só um outro terreno', () => expect(entraVirado(NOME, ['Forest'])).toBe(true));
  it('entra desvirado com dois outros terrenos', () => expect(entraVirado(NOME, ['Forest', 'Command Tower'])).toBe(false));`);
  }],
  [/^This land enters tapped unless your opponents control eight or more lands\.$/, (_m, o) => {
    o.code.push('land.tappedUnlessOpponentsLands(8)');
    o.tests.push(`  it('entra virado se os oponentes têm menos de oito terrenos', () => expect(entraVirado(NOME, [], [], true, Array(7).fill('Forest'))).toBe(true));
  it('entra desvirado se os oponentes têm oito ou mais terrenos', () => expect(entraVirado(NOME, [], [], true, Array(8).fill('Forest'))).toBe(false));`);
  }],
  [/^As this land enters, you may reveal an? (\w+) or (\w+) card from your hand\. If you don't, this land enters tapped\.$/, (m, o) => {
    o.code.push(`land.snarl('${m[1]}', '${m[2]}')`);
    o.tests.push(`  it('entra virado sem ${m[1]} nem ${m[2]} na mão', () => expect(entraVirado(NOME, [], ['Command Tower'])).toBe(true));
  it('revelando ${m[1]} da mão, entra desvirado', () => expect(entraVirado(NOME, [], ['${m[1]}'], true)).toBe(false));
  it('pode não revelar e entrar virado', () => expect(entraVirado(NOME, [], ['${m[2]}'], false)).toBe(true));`);
  }],
  [/^When this land enters, scry 1\.( \(.*\))?$/, (_m, o) => {
    o.code.push('land.scryOnEnter()');
    o.tests.push(`  it('CR 701.22: ao entrar, vidência 1', () => {
    const tg = jogarTerreno(NOME, { grimorio: ['Forest', 'Island'] });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'bottom'])), order: d.items.map((i) => i.id) } : null));
    tg.resolve();
    expect(tg.names(0, 'library')).toEqual(['Island', 'Forest']);
  });`);
  }],
  [/^\{4\}, \{T\}: Scry 1\.( \(.*\))?$/, (_m, o) => {
    o.code.push(`land.scryAbility('{4}')`);
    o.tests.push(`  it('{4}, {T}: vidência 1', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring'], []], library: [['Forest', 'Island'], []] });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'bottom'])), order: d.items.map((i) => i.id) } : null));
    tg.activate(NOME, 'Vidência').resolve();
    expect(tg.names(0, 'library')).toEqual(['Island', 'Forest']);
  });`);
  }],
  [/^(\{.+\}), \{T\}: Surveil 1\.( \(.*\))?$/, (m, o) => {
    o.code.push(`land.surveilAbility('${m[1]}')`);
    o.tests.push(`  it('${m[1]}, {T}: vigiar 1', () => {
    const tg = setup({ battlefield: [[NOME, ${sources(m[1])}], []], library: [['Forest', 'Island'], []] });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'graveyard'])), order: d.items.map((i) => i.id) } : null));
    tg.activate(NOME, 'Vigiar').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
  });`);
  }],
  [/^Cycling \{(\w)\}( \(.*\))?$/, (m, o) => {
    o.code.push(`cycling('{${m[1]}}')`);
    o.tests.push(`  it('CR 702.29: ciclagem descarta e compra', () => {
    const tg = setup({ battlefield: [['Sol Ring'], []], hand: [[NOME], []], library: [['Island'], []] });
    tg.activate(NOME, 'Ciclagem').resolve();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });`);
  }],
  [/^When this land enters, return a land you control to its owner's hand\.$/, (_m, o) => {
    o.code.push('land.bounceLand()');
    o.tests.push(`  it('ao entrar, devolve um terreno seu para a mão', () => {
    const tg = jogarTerreno(NOME, { campo: ['Forest'] });
    tg.choose('Devolva um terreno', ['Forest']).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });`);
  }],
  [/^\{T\}, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle\.$/, (_m, o) => {
    o.code.push('land.fetchBasic()');
    o.tests.push(`  it('busca um terreno básico para o campo, virado', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Plains', 'Sol Ring'], []] });
    tg.choose('terreno básico', ['Plains']).activate(NOME, 'Sacrifique').resolve();
    expect(tg.find(NOME)).toBeNull();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
  });`);
  }],
];

function translate(name: string): Out | null {
  const card = dados[name];
  const f = card.faces[0];
  const o: Out = { code: [], tests: [], mana: [], uses: new Set() };
  for (const st of f.subtypes) if (BASIC[st] && !f.oracleText.includes('({T}: Add')) o.mana.push(BASIC[st]);
  for (const line of f.oracleText.split('\n').map((x) => x.trim()).filter(Boolean)) {
    const rule = RULES.find(([re]) => re.test(line));
    if (!rule) return null;
    rule[1](line.match(rule[0])!, o, name, f.subtypes);
  }
  return o;
}

// todas as cartas dos decks (gerado/cartas.json), inclusive as de decks importados pela tela Decks
const lev = Object.values(dados).map((c) => ({ nome: c.name, tipo: c.faces.map((f) => f.typeLine).join(' // '), ficha_ou_auxiliar: false, basico: c.faces[0].typeLine.startsWith('Basic') }));
let made = 0;
const skipped: string[] = [];
for (const l of lev) {
  if (l.ficha_ou_auxiliar || l.basico) continue;
  if (!/Land/.test(l.tipo.split('//')[0])) continue;
  const s = slug(l.nome);
  if (existsSync(join(raiz, 'cartas', 'defs', `${s}.ts`))) continue;
  const o = translate(l.nome);
  if (!o) { skipped.push(l.nome); continue; }
  const lines = dados[l.nome].faces[0].oracleText.split('\n');
  const imports = new Set(['defineCard']);
  for (const c of o.code) for (const fn of ['mana', 'land', 'cycling']) if (c.startsWith(fn)) imports.add(fn);
  const def = `// ${l.nome}\n${lines.map((x) => `// ${x}`).join('\n')}\n// (gerado por ferramentas/rascunho.ts e revisado)\nimport { ${[...imports].sort().join(', ')} } from '../../motor/api.ts';\n\nexport default defineCard({\n  name: ${JSON.stringify(l.nome)},\n  faces: [{ abilities: [\n${o.code.map((c) => `    ${c},`).join('\n')}\n  ] }],\n});\n`;
  const mana = [...new Set(o.mana)].sort();
  const usesHelpers = o.tests.join('\n');
  const helperImports = ['alternativasDeMana', 'setup', 'entraVirado', 'jogarTerreno'].filter((h) => h === 'alternativasDeMana' || usesHelpers.includes(h));
  const test = `import { describe, expect, it } from 'vitest';\nimport { ${helperImports.join(', ')} } from '../../testes/padroes.ts';\n\nconst NOME = ${JSON.stringify(l.nome)};\n\ndescribe(NOME, () => {\n  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(${JSON.stringify(mana)}));\n${o.tests.join('\n')}\n});\n`;
  if (!dry) {
    writeFileSync(join(raiz, 'cartas', 'defs', `${s}.ts`), def);
    writeFileSync(join(raiz, 'cartas', 'defs', `${s}.test.ts`), test);
  }
  made++;
}
console.log(`${made} terrenos gerados. Sem padrão (à mão): ${skipped.join('; ')}`);
