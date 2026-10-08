// Teste opcional de DOM: usa jsdom já instalado. A aplicação entregue não depende dele.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { JSDOM } = require(process.argv[2] || 'jsdom');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const page = fs.readFileSync(path.join(root, 'simulador/index.html'), 'utf8');
const dom = new JSDOM(page, { url: 'file://' + path.join(root, 'simulador/index.html').replaceAll('\\', '/'), runScripts: 'outside-only' });
const { window } = dom, document = window.document;
const $ = id => document.getElementById(id);
for (const file of ['dados.js', 'motor.js', 'app.js']) window.eval(fs.readFileSync(path.join(root, 'simulador', file), 'utf8'));
let count = 0;
function test(name, fn) { fn(); count++; console.log('OK ' + name); }
function click(selector) { const element = document.querySelector(selector); assert(element, selector); element.click(); }
function search(query) { $('search').value = query; $('search').dispatchEvent(new window.Event('input', { bubbles: true })); }
function reset() { $('reset').click(); }

test('a aplicação inicializa todos os painéis usando arquivos locais', () => {
  assert.equal(document.querySelectorAll('.player').length, 4);
  assert.equal(document.querySelectorAll('.quiz-card').length, 51);
  assert($('step-label').textContent.includes('Manutenção'));
  assert($('search-status').textContent.includes('3312'));
  assert($('search-status').textContent.includes('738'));
});
test('ações inválidas mostram motivo sem criar objeto na pilha', () => {
  click('[data-action="sorcery"]'); assert($('message').classList.contains('error')); assert.equal(document.querySelectorAll('.stack-item').length, 0);
});
test('passar pelas etapas e conjurar atualiza a pilha e o jogador', () => {
  $('all-pass').click(); $('all-pass').click(); assert($('step-label').textContent.includes('Principal 1'));
  click('[data-action="sorcery"]'); assert.equal(document.querySelectorAll('.stack-item').length, 1);
  $('pass').click(); assert($('pass').textContent.startsWith('Bruno'));
  click('[data-action="instant"]'); assert.equal(document.querySelectorAll('.stack-item').length, 2);
  $('all-pass').click(); assert.equal(document.querySelectorAll('.stack-item').length, 1); assert($('pass').textContent.startsWith('Ana'));
});
test('seletor permite demonstrar a falta de prioridade', () => {
  $('actor').value = '2'; $('actor').dispatchEvent(new window.Event('change', { bubbles: true }));
  click('[data-action="instant"]'); assert($('message').textContent.includes('não tem prioridade')); assert.equal(document.querySelectorAll('.stack-item').length, 1);
});
test('desfazer restaura o estado anterior do laboratório', () => {
  $('undo').click(); assert.equal(document.querySelectorAll('.stack-item').length, 2); assert($('pass').textContent.startsWith('Bruno'));
});
test('configuração de duas pessoas aplica a compra inicial correta', () => {
  $('count').value = '2'; reset(); assert.equal(document.querySelectorAll('.player').length, 2);
  $('all-pass').click(); assert($('step-label').textContent.includes('Principal 1')); assert($('history').textContent.includes('pula sua etapa de compra'));
});
test('perguntas mostram gabarito, explicação e acesso à regra', () => {
  click('[data-tab="quiz"]'); assert.equal($('quiz').hidden, false);
  click('[data-question="Q01"][data-option="0"]'); assert(document.querySelector('.answer').textContent.includes('Reveja'));
  click('[data-question="Q01"][data-option="1"]'); assert(document.querySelector('.answer').textContent.includes('Correto'));
  click('[data-rule-query="117.3c"]'); assert.equal($('rules').hidden, false); assert.equal($('search').value, '117.3c');
  assert.equal(document.querySelector('.result h3').textContent, 'CR 117.3c');
});
test('busca por número preserva texto e sub-regras oficiais', () => {
  search('903.9'); assert.equal(document.querySelectorAll('.result').length, 4); assert($('search-results').textContent.includes('state-based action'));
  search('701.6'); assert.equal(document.querySelector('.result h3').textContent, 'CR 701.6'); assert($('search-results').textContent.includes('Counter'));
});
test('atalhos em português apontam aos capítulos e permitem paginação', () => {
  search('prioridade'); assert($('search-results').textContent.includes('CR 117'));
  search('combate'); assert(document.querySelector('#more-results'));
  const before = document.querySelectorAll('.result').length; click('#more-results'); assert(document.querySelectorAll('.result').length > before);
  search('comandante'); assert($('search-results').textContent.includes('Commander'));
});
test('busca livre acha regras e termos de glossário', () => {
  search('ward'); assert($('search-results').textContent.includes('Ward'));
  search('esta-palavra-nao-existe-9988'); assert($('search-results').textContent.includes('Nenhum resultado'));
});
test('filtro de perguntas usa os assuntos reais', () => {
  $('quiz-filter').value = 'Commander'; $('quiz-filter').dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(document.querySelectorAll('.quiz-card').length, window.MTG_DATA.scenarios.filter(s => s.topic === 'Commander').length);
});
test('exemplo de limpeza mostra prioridade excepcional na interface', () => {
  $('count').value = '4'; $('cleanup-trigger').checked = true; reset();
  for (let i = 0; i < 20 && !$('step-label').textContent.includes('Limpeza'); i++) $('all-pass').click();
  assert($('step-label').textContent.includes('Limpeza')); assert.equal(document.querySelectorAll('.stack-item').length, 1);
  $('all-pass').click(); assert.equal(document.querySelectorAll('.stack-item').length, 0); assert($('step-label').textContent.includes('Limpeza'));
  $('all-pass').click(); assert($('step-label').textContent.includes('Manutenção')); assert($('pass').textContent.startsWith('Bruno'));
});
console.log('\n' + count + ' verificações de interface passaram (DOM, sem renderização visual).');
window.close();
