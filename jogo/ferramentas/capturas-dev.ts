// Capturas da área do desenvolvedor (/dev) com dados de exemplo: sobe o servidor numa pasta temporária, grava um relato
// e alguns erros do navegador, entra com a chave e fotografa cada aba no computador e no celular.
// Uso: node ferramentas/capturas-dev.ts [pasta-de-saida]   (precisa do cliente compilado: npm run cliente:build)

import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = resolve(process.argv[2] ?? join(RAIZ, 'entregas', 'capturas-dev'));
const PORTA = 8097;
const CHAVE = 'chave-das-capturas-0123456789';
const dados = mkdtempSync(join(tmpdir(), 'capturas-dev-'));
mkdirSync(SAIDA, { recursive: true });

// um relato com print, a mesa como a pessoa via e o diagnóstico da página
const id = '20261112-213005-k3f9';
const pasta = join(dados, 'relatos', id);
mkdirSync(pasta, { recursive: true });
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800"><rect width="100%" height="100%" fill="#1b1a1d"/><rect x="420" y="250" width="440" height="300" rx="16" fill="#2b292d" stroke="#e85d28" stroke-width="6"/><text x="640" y="410" font-size="40" fill="#f2e8d5" text-anchor="middle" font-family="sans-serif">print da mesa</text></svg>`;
writeFileSync(join(pasta, '01-tela-marcada.webp'), await sharp(Buffer.from(svg)).webp().toBuffer());
const vista = {
  turn: { round: 4, number: 13, active: 1, step: 'main1', stepName: 'Fase principal 1' }, priority: 0,
  players: [{ name: 'Caio', life: 31, handCount: 5, libraryCount: 81 }, { name: 'Ana', life: 24, handCount: 3, libraryCount: 79 }, { name: 'Bot Gisa', life: 12, handCount: 6, libraryCount: 77, lost: false }],
  stack: [{ name: 'Lightning Bolt', targets: ['Caio'] }], decision: { kind: 'priority' }, waiting: null, gameOver: null,
  log: [{ round: 4, text: 'Ana conjura Lightning Bolt mirando Caio' }, { round: 4, text: 'Caio recebe prioridade' }],
};
writeFileSync(join(pasta, 'relato.json'), JSON.stringify({
  id, em: new Date(Date.now() - 42 * 60_000).toISOString(), estado: 'aberto', resolucao: null, tipo: 'regra', repete: 'sempre',
  oque: 'Usei Counterspell no Lightning Bolt da Ana e o Bolt resolveu mesmo assim: eu levei os 3 de dano.',
  esperado: 'O Bolt deveria ir para o cemitério sem resolver.', passos: 'Ana conjurou Bolt em mim, eu respondi com Counterspell com 2 ilhas.',
  cartas: ['Counterspell', 'Lightning Bolt'], nome: 'Caio',
  imagens: [{ arquivo: '01-tela-marcada.webp', origem: 'tela', marcada: true, bytes: 18000 }], partida: false, partidaAusente: 'exemplo das capturas',
  contexto: {
    tela: 'sala', conectado: true, janela: { largura: 1536, altura: 864, densidade: 1.25 }, toque: false, navegador: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/142',
    sala: { codigo: 'XK4P', estado: 'jogando', assentos: [{ nome: 'Caio', tipo: 'humano' }, { nome: 'Ana', tipo: 'humano' }, { nome: 'Gisa', tipo: 'bot' }] }, voce: 0, vista,
    diagnostico: { erros: [{ em: new Date().toISOString(), tipo: 'erro', texto: "TypeError: Cannot read properties of undefined (reading 'targets')\n    at Pilha (index-AbC123xY.js:1:2345)" }], enviadas: [{ em: new Date().toISOString(), texto: '{"t":"responder","resposta":{"cast":"Counterspell"}}' }], doServidor: [], abertaHaSegundos: 2520 },
  },
  servidor: { versao: 'c6ace139 2026-11-12T20:00:00-03:00 Reportar erro', node: 'v24.1.0', memoriaMB: 210, salas: 3, diario: [{ em: Date.now() - 50 * 60_000, nivel: 'aviso', texto: 'sala XK4P: bot Gisa demorou 4,2 s para decidir' }] },
}, null, 2));

const estaticos = join(RAIZ, 'cliente', 'dist');
const proc = spawn(process.execPath, ['servidor/index.ts'], { cwd: RAIZ, env: { ...process.env, PORTA: String(PORTA), DADOS: dados, SENHA_ACESSO: 'grupo', SENHA_DEV: CHAVE, ESTATICOS: estaticos, HTTPS: '' }, stdio: ['ignore', 'pipe', 'pipe'] });
let saida = '';
proc.stdout.on('data', (d) => { saida += d; });
proc.stderr.on('data', (d) => { saida += d; });
const fim = Date.now() + 120_000;
while (!saida.includes('Magic Commander: http://localhost:')) {
  if (proc.exitCode !== null || Date.now() > fim) { console.error(saida); process.exit(1); }
  await new Promise((r) => setTimeout(r, 200));
}
const base = `http://localhost:${PORTA}`;
const jogador = (await fetch(`${base}/api/entrar`, { method: 'POST', body: JSON.stringify({ senha: 'grupo' }) })).headers.get('set-cookie')!.split(';')[0];
const erro = (texto: string, pilha: string, tela: string) => fetch(`${base}/api/erros-cliente`, { method: 'POST', headers: { cookie: jogador, 'content-type': 'application/json' }, body: JSON.stringify({ tipo: 'erro', texto, pilha, tela, navegador: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Safari/604.1' }) });
for (let i = 0; i < 4; i++) await erro("TypeError: Cannot read properties of undefined (reading 'targets')", 'TypeError: ...\n    at Pilha (http://x/assets/index-AbC123xY.js:1:2345)\n    at Mesa (http://x/assets/index-AbC123xY.js:1:999)', 'mesa');
await erro('Error: imagem da carta sem tamanho', 'Error: imagem da carta sem tamanho\n    at medir (http://x/assets/index-AbC123xY.js:3:10)', 'saguao');

const nav = await chromium.launch();
for (const [nome, viewport] of [['pc', { width: 1440, height: 900 }], ['celular', { width: 390, height: 844 }]] as const) {
  const ctx = await nav.newContext({ viewport, deviceScaleFactor: nome === 'celular' ? 2 : 1, colorScheme: 'dark' });
  const p = await ctx.newPage();
  await p.goto(`${base}/dev`);
  await p.waitForSelector('.dev-entrar');
  await p.screenshot({ path: join(SAIDA, `${nome}-0-entrar.png`) });
  await p.fill('.dev-entrar input', CHAVE);
  await p.click('.dev-entrar button[type=submit]');
  await p.waitForSelector('.dev-grade-numeros');
  await p.waitForTimeout(400);
  await p.screenshot({ path: join(SAIDA, `${nome}-1-painel.png`), fullPage: true });
  for (const [i, aba, esperar] of [[2, 'relatos', '.dev-item'], [3, `relatos/${id}`, '.dev-galeria img'], [4, 'erros', '.dev-erros li'], [5, 'servidor', '.dev-diario li'], [6, 'salas', '.dev-cabeca'], [7, 'cartas', '.dev-cabeca'], [8, 'acesso', '.dev-tabela']] as const) {
    await p.goto(`${base}/dev#/${aba}`);
    await p.waitForSelector(esperar);
    if (aba === 'erros') await p.click('.dev-erro-linha');
    await p.waitForTimeout(500);
    await p.screenshot({ path: join(SAIDA, `${nome}-${i}-${aba.replace('/', '-')}.png`), fullPage: true });
  }
  await ctx.close();
}
await nav.close();
proc.kill();
await new Promise((r) => proc.once('exit', r));
rmSync(dados, { recursive: true, force: true });
console.log(`Capturas em ${SAIDA}`);
