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

let fotoPagamento = false;

/** responde as decisões pendentes de forma simples; para quando Ana tem prioridade */
async function jogarAteMinhaPrioridade(p: Page, limite = 40): Promise<void> {
  for (let i = 0; i < limite; i++) {
    await p.waitForTimeout(250);
    if (await p.getByText('Você tem prioridade').isVisible()) return;
    // a primeira vez que aparece um pagamento: fotografa e paga virando um terreno na mesa
    if (!fotoPagamento && await p.locator('.coluna-dir .pagamento').isVisible().catch(() => false)) {
      fotoPagamento = true;
      await foto(p, '15-pagamento');
      // a de cima do leque (as de baixo ficam cobertas)
      const fonte = p.locator('.area-eu .campo .carta.realce-acao').last();
      if (await fonte.isVisible().catch(() => false)) {
        await fonte.click({ timeout: 3000 }).catch(() => {});
        await foto(p, '16-pagamento-virou-terreno');
      }
      continue;
    }
    if (await p.locator('.coluna-dir .decisao .item:not([disabled])').first().isVisible().catch(() => false)) {
      await p.locator('.coluna-dir .decisao .item:not([disabled])').first().click();
      await clicar(p, 'Confirmar');
      continue;
    }
    for (const nome of ['Manter', 'Pagar automaticamente', 'Confirmar', 'Não atacar', 'Não bloquear', 'Nenhum', /^Confirmar/]) if (await clicar(p, nome)) break;
  }
}

/** clica numa carta da mão com brilho e escolhe a ação do menu que começa com o texto pedido */
async function jogarDaMao(p: Page, acao: RegExp): Promise<boolean> {
  const cartas = p.locator('.mao-cartas .carta.realce-acao');
  const n = await cartas.count();
  for (let i = 0; i < n; i++) {
    // no leque, cada carta fica coberta pela vizinha da direita: clica na borda esquerda
    await cartas.nth(i).click({ position: { x: 8, y: 40 }, timeout: 3000 }).catch(() => {});
    const b = p.locator('.menu-acoes button').filter({ hasText: acao }).first();
    if (await b.isVisible().catch(() => false)) { await b.click(); return true; }
    await p.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click({ timeout: 2000 }).catch(() => {});
  }
  return false;
}

/** joga terrenos e mágicas quando der; senão passa o turno */
async function jogarUmPouco(p: Page, rodadas: number): Promise<void> {
  for (let k = 0; k < rodadas; k++) {
    await jogarAteMinhaPrioridade(p, 80);
    if (await jogarDaMao(p, /^Jogar /)) continue;
    if (await jogarDaMao(p, /^Conjurar: /)) { await jogarAteMinhaPrioridade(p, 20); continue; }
    await clicar(p, 'Passar até o fim do turno');
  }
}

try {
  // ---------------- quatro jogadores
  const ctx = await navegador.newContext({ viewport: { width: 1600, height: 950 } });
  ctx.setDefaultTimeout(20000);
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
    await p.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click();
  }
  // arrastar uma carta da mão até o campo (fotografa no meio do caminho)
  const jogavel = p.locator('.mao-cartas .carta.realce-acao').first();
  const campo = await p.locator('.area-eu .campo').boundingBox();
  const caixa = await jogavel.boundingBox().catch(() => null);
  if (caixa && campo) {
    await p.mouse.move(caixa.x + 10, caixa.y + 40);
    await p.mouse.down();
    for (let k = 1; k <= 8; k++) await p.mouse.move(caixa.x + 10 + (campo.x + campo.width * .45 - caixa.x) * k / 8, caixa.y + 40 + (campo.y + campo.height * .4 - caixa.y) * k / 8);
    await foto(p, '07b-arrastar-da-mao');
    await p.mouse.up();
    await jogarAteMinhaPrioridade(p, 30);
    await foto(p, '07c-depois-de-soltar');
  }
  // clique direito: numa permanente sua, no espaço vazio do seu campo e numa carta da mão
  const permanente = p.locator('.area-eu .campo .carta').last();
  if (await permanente.isVisible().catch(() => false)) {
    await permanente.click({ button: 'right', timeout: 3000 }).catch(() => {});
    const marcadores = p.locator('.menu-acoes').getByRole('menuitem', { name: 'Marcadores' });
    if (await marcadores.isVisible().catch(() => false)) await marcadores.hover();
    await foto(p, '17-menu-direito-carta');
    await p.keyboard.press('Escape');
    await p.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click({ timeout: 3000 }).catch(() => {});
  }
  const campoMeu = await p.locator('.area-eu .campo').boundingBox();
  if (campoMeu) {
    await p.mouse.click(campoMeu.x + campoMeu.width * .5, campoMeu.y + campoMeu.height * .35, { button: 'right' });
    await foto(p, '18-menu-direito-campo');
    await p.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click({ timeout: 3000 }).catch(() => {});
  }
  const daMao = p.locator('.mao-cartas .carta').first();
  await daMao.click({ button: 'right', position: { x: 8, y: 40 }, timeout: 3000 }).catch(() => {});
  const revelar = p.locator('.menu-acoes').getByRole('menuitem', { name: 'Revelar' });
  if (await revelar.isVisible().catch(() => false)) {
    await revelar.hover();
    await p.locator('.menu-acoes.submenu').getByRole('menuitem', { name: 'Para todos' }).click({ timeout: 3000 }).catch(() => {});
    await foto(p, '19-carta-revelada');
  } else await p.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click({ timeout: 3000 }).catch(() => {});
  await p.getByRole('button', { name: 'Ajuste manual' }).click();
  await foto(p, '08-ajuste-manual');
  await p.getByRole('button', { name: 'Criar ficha' }).click();
  await foto(p, '09-ajuste-ficha');
  await p.getByRole('button', { name: 'Fechar' }).click();
  await p.getByRole('button', { name: 'Paradas' }).click();
  await foto(p, '10-paradas');
  await p.getByRole('button', { name: 'Fechar' }).click();
  // algumas voltas da mesa com os bots
  await jogarUmPouco(p, 24);
  await jogarAteMinhaPrioridade(p, 80);
  await foto(p, '11-mesa-depois');
  // mover uma permanente para outro lugar da área
  const minha = p.locator('.area-eu .campo .carta').first();
  const cm = await minha.boundingBox().catch(() => null);
  const cc = await p.locator('.area-eu .campo').boundingBox();
  if (cm && cc) {
    await p.mouse.move(cm.x + cm.width / 2, cm.y + cm.height / 2);
    await p.mouse.down();
    for (let k = 1; k <= 8; k++) await p.mouse.move(cm.x + cm.width / 2 + (cc.x + cc.width * .55 - cm.x) * k / 8, cm.y + cm.height / 2 + (cc.y + cc.height * .5 - cm.y) * k / 8);
    await p.mouse.up();
    await foto(p, '11c-carta-movida');
  }
  await p.getByRole('button', { name: 'Recolher a barra' }).click();
  await foto(p, '11b-mesa-recolhida');
  await p.getByRole('button', { name: 'Abrir a barra' }).click();
  await p.locator('.botao-zona').first().click();
  await foto(p, '12-cemiterio');
  await ctx.close();

  // ---------------- um contra um, tela menor
  const ctx2 = await navegador.newContext({ viewport: { width: 1280, height: 800 } });
  ctx2.setDefaultTimeout(20000);
  const q = await ctx2.newPage();
  await entrar(q);
  await q.getByLabel('Seu nome na mesa').fill('Bruno');
  await q.getByRole('button', { name: 'Um contra um' }).click();
  await q.locator('form').filter({ hasText: 'Criar sala' }).getByLabel('Senha da sala').fill('mesa');
  await q.getByRole('button', { name: 'Criar', exact: true }).click();
  await q.getByRole('heading', { name: 'Lugares' }).waitFor();
  await q.locator('select').first().selectOption({ index: 5 });
  await q.locator('.deck').nth(3).click();
  await q.getByRole('radio', { name: /^Livre/ }).click();
  await q.waitForTimeout(300);
  await foto(q, '13a-saguao-mulligan-livre');
  await q.getByRole('button', { name: 'Começar a partida' }).click();
  await q.getByText('Mão inicial').waitFor({ timeout: 20000 });
  await foto(q, '13b-mao-inicial-livre');
  await q.getByRole('button', { name: 'Mulligan' }).click();
  await q.waitForTimeout(800);
  await foto(q, '13c-depois-do-mulligan-livre');
  await jogarAteMinhaPrioridade(q);
  await foto(q, '13-duelo');
  await jogarUmPouco(q, 10);
  await jogarAteMinhaPrioridade(q, 40);
  await foto(q, '14-duelo-depois');
  await ctx2.close();
} catch (e) {
  for (const [i, p] of paginas.entries()) if (!p.isClosed()) await p.screenshot({ path: join(SAIDA, `falha-${i}.png`) }).catch(() => {});
  throw e;
} finally {
  await navegador.close();
  servidor.kill();
}
