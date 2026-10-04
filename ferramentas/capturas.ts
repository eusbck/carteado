// Capturas de tela da interface com um navegador automatizado (Playwright), para conferir
// o visual. Sobe um servidor temporário (porta e dados próprios), joga um pouco e fotografa.
// Uso: node ferramentas/capturas.ts   → imagens em .cache/capturas/

import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from 'playwright';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = join(RAIZ, '.cache', 'capturas');
const DADOS = join(RAIZ, '.cache', 'capturas-dados');
const PORTA = 8091;
const URL = `http://localhost:${PORTA}`;

rmSync(DADOS, { recursive: true, force: true });
mkdirSync(SAIDA, { recursive: true });

const servidor = spawn(process.execPath, [join(RAIZ, 'servidor', 'index.ts')], {
  env: { ...process.env, PORTA: String(PORTA), DADOS, SENHA_ACESSO: 'teste-capturas' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
servidor.stderr.on('data', (d) => process.stderr.write(`[servidor] ${d}`));
await new Promise<void>((ok, falha) => {
  const t = setTimeout(() => falha(new Error('servidor não subiu')), 30000);
  servidor.stdout.on('data', (d) => { if (String(d).includes('http://localhost')) { clearTimeout(t); ok(); } });
});

const navegador = await chromium.launch();
async function foto(p: Page, nome: string): Promise<void> {
  await p.waitForTimeout(400);
  await p.screenshot({ path: join(SAIDA, `${nome}.png`) });
  console.log(`captura: ${nome}.png`);
}

const paginas: Page[] = [];
async function entrar(p: Page): Promise<void> {
  paginas.push(p);
  p.on('console', (m) => { if (m.type() === 'error') console.error(`[navegador] ${m.text()}`); });
  p.on('pageerror', (e) => console.error(`[navegador] ${e.message}`));
  await p.goto(URL);
  await p.getByLabel('Senha do servidor').fill('teste-capturas');
  await p.getByRole('button', { name: 'Entrar' }).click();
  await p.getByText('Criar sala').waitFor();
}

async function clicar(p: Page, nome: string | RegExp): Promise<boolean> {
  const b = p.getByRole('button', { name: nome }).first();
  if (await b.isVisible().catch(() => false) && await b.isEnabled().catch(() => false)) { await b.click(); return true; }
  return false;
}

/** responde as decisões pendentes de forma simples; para quando Ana tem prioridade */
async function jogarAteMinhaPrioridade(p: Page, limite = 40): Promise<void> {
  for (let i = 0; i < limite; i++) {
    await p.waitForTimeout(250);
    if (await p.getByText('Você tem prioridade').isVisible()) return;
    if (await p.locator('.decisao .item:not([disabled])').first().isVisible().catch(() => false)) {
      await p.locator('.decisao .item:not([disabled])').first().click();
      await clicar(p, 'Confirmar');
      continue;
    }
    for (const nome of ['Manter', 'Pagar automaticamente', 'Confirmar', 'Não atacar', 'Não bloquear', 'Nenhum', /^Confirmar/]) if (await clicar(p, nome)) break;
  }
}

/** joga terrenos e mágicas quando der; senão passa o turno */
async function jogarUmPouco(p: Page, rodadas: number): Promise<void> {
  for (let k = 0; k < rodadas; k++) {
    await jogarAteMinhaPrioridade(p, 80);
    if (await clicar(p, /^Jogar /)) continue;
    if (await clicar(p, /^Conjurar: /)) { await jogarAteMinhaPrioridade(p, 20); continue; }
    await clicar(p, 'Passar até o fim do turno');
  }
}

try {
  // ---------------- quatro jogadores
  const ctx = await navegador.newContext({ viewport: { width: 1600, height: 950 } });
  const p = await ctx.newPage();
  await p.goto(URL);
  await foto(p, '01-entrada');
  await entrar(p);
  await p.getByLabel('Seu nome na mesa').fill('Ana');
  await foto(p, '02-inicio');
  await p.locator('form').filter({ hasText: 'Criar sala' }).getByLabel('Senha da sala').fill('mesa');
  await p.getByRole('button', { name: 'Criar', exact: true }).click();
  await p.getByRole('heading', { name: 'Lugares' }).waitFor();
  const selects = p.locator('select');
  for (let i = 0; i < 3; i++) {
    await selects.nth(i).selectOption({ index: i + 2 });
    await p.waitForTimeout(150);
  }
  await p.locator('.deck').first().click();
  await foto(p, '03-saguao');
  await p.getByRole('button', { name: 'Começar a partida' }).click();
  await p.getByText('Mão inicial').waitFor({ timeout: 20000 });
  await foto(p, '04-mulligan');
  await jogarAteMinhaPrioridade(p);
  await foto(p, '05-mesa-prioridade');
  const carta = p.locator('.mao-cartas .carta').first();
  await carta.hover();
  await foto(p, '06-zoom');
  const comAcao = p.locator('.carta.realce-acao').first();
  if (await comAcao.count()) {
    await comAcao.click();
    await foto(p, '07-menu-acoes');
    await p.getByRole('button', { name: 'Cancelar' }).click();
  }
  await p.getByRole('button', { name: 'Ajuste manual…' }).click();
  await foto(p, '08-ajuste-manual');
  await p.getByRole('button', { name: 'Criar ficha' }).click();
  await foto(p, '09-ajuste-ficha');
  await p.getByRole('button', { name: 'Fechar' }).click();
  await p.getByRole('button', { name: 'Paradas' }).click();
  await foto(p, '10-paradas');
  await p.getByRole('button', { name: 'Fechar' }).click();
  // algumas voltas da mesa com os bots
  await jogarUmPouco(p, 40);
  await foto(p, '11-mesa-depois');
  await p.locator('.botao-zona').first().click();
  await foto(p, '12-cemiterio');
  await ctx.close();

  // ---------------- um contra um, tela menor
  const ctx2 = await navegador.newContext({ viewport: { width: 1280, height: 800 } });
  const q = await ctx2.newPage();
  await entrar(q);
  await q.getByLabel('Seu nome na mesa').fill('Bruno');
  await q.getByRole('button', { name: 'Um contra um' }).click();
  await q.locator('form').filter({ hasText: 'Criar sala' }).getByLabel('Senha da sala').fill('mesa');
  await q.getByRole('button', { name: 'Criar', exact: true }).click();
  await q.getByRole('heading', { name: 'Lugares' }).waitFor();
  await q.locator('select').first().selectOption({ index: 5 });
  await q.locator('.deck').nth(3).click();
  await q.getByRole('button', { name: 'Começar a partida' }).click();
  await q.getByText('Mão inicial').waitFor({ timeout: 20000 });
  await jogarAteMinhaPrioridade(q);
  await foto(q, '13-duelo');
  await ctx2.close();
} catch (e) {
  for (const [i, p] of paginas.entries()) if (!p.isClosed()) await p.screenshot({ path: join(SAIDA, `falha-${i}.png`) }).catch(() => {});
  throw e;
} finally {
  await navegador.close();
  servidor.kill();
}
