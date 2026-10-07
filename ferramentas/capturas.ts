// Capturas de tela da interface com um navegador automatizado (Playwright), para conferir
// o visual. Sobe um servidor temporário (porta e dados próprios), joga um pouco e fotografa.
// As partes antigas jogam com todos os auxílios ligados (usam o brilho para achar o que jogar);
// as da fase 8 mostram a mesa real, o combate por cliques e o desfazer.
// Uso: node ferramentas/capturas.ts   → imagens em .cache/capturas/

import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type BrowserContext, type Page } from 'playwright';
import { Banco } from '../servidor/banco.ts';
import { gerarSalas } from './cenarios.ts';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = join(RAIZ, '.cache', 'capturas');
const DADOS = join(RAIZ, '.cache', 'capturas-dados');
const PORTA = Number(process.env.PORTA_CAPTURAS ?? 8091);
const URL = `http://localhost:${PORTA}`;

rmSync(DADOS, { recursive: true, force: true });
// imagens de uma rodada anterior saem (nomes que mudaram não ficam para trás)
rmSync(SAIDA, { recursive: true, force: true });
mkdirSync(SAIDA, { recursive: true });
// salas prontas para as capturas de combate (ataque em 4 jogadores, bloqueio em 1v1)
{
  const banco = new Banco(join(DADOS, 'jogo.sqlite'));
  const prontas = gerarSalas(banco, ['ATACA', 'BLOQU']);
  banco.fechar();
  if (prontas.length < 2) throw new Error(`cenários de combate não ficaram prontos: ${prontas.join(', ')}`);
}

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

/** a mesa ocupa a tela inteira (sem faixa preta embaixo nem corte), com ou sem janela aberta */
async function conferirMesa(p: Page, quando: string): Promise<void> {
  const r = await p.evaluate(() => {
    const t = document.querySelector('.tabuleiro')!.getBoundingClientRect();
    const l = document.querySelector('.lateral')!.getBoundingClientRect();
    return { vw: innerWidth, vh: innerHeight, th: t.height, tw: t.width, lh: l.height, lw: l.width };
  });
  if (Math.abs(r.th - r.vh) > 1 || Math.abs(r.lh - r.vh) > 1 || Math.abs(r.tw + r.lw - r.vw) > 1) throw new Error(`mesa fora do lugar (${quando}): ${JSON.stringify(r)}`);
}

/** a janela aberta está no centro da tela e o X dela recebe o clique */
async function conferirJanela(p: Page, quando: string): Promise<void> {
  await p.locator('.janela-caixa').waitFor();
  // espera a animação de entrada terminar (com a máquina ocupada ela pode começar atrasada)
  await p.locator('.janela-caixa').evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished)));
  await p.waitForTimeout(50);
  const r = await p.evaluate(() => {
    const c = document.querySelector('.janela-caixa')!.getBoundingClientRect();
    const x = document.querySelector('.janela-caixa .janela-x')!.getBoundingClientRect();
    const sob = document.elementFromPoint(x.left + x.width / 2, x.top + x.height / 2)?.closest('button')?.getAttribute('aria-label');
    return { dx: c.left + c.width / 2 - innerWidth / 2, dy: c.top + c.height / 2 - innerHeight / 2, sob };
  });
  if (Math.abs(r.dx) > 2 || Math.abs(r.dy) > 2 || r.sob !== 'Fechar') throw new Error(`janela fora do lugar (${quando}): ${JSON.stringify(r)}`);
}

/** todos os auxílios ligados, como a mesa da fase 7 (as partes antigas acham as jogadas pelo brilho) */
async function comAuxilios(ctx: BrowserContext): Promise<void> {
  await ctx.addInitScript(() => {
    if (!sessionStorage.getItem('capturas:prefs')) {
      sessionStorage.setItem('capturas:prefs', '1');
      localStorage.setItem('commander-da-mesa:preferencias', JSON.stringify({ nivel: 'personalizado', personalizado: { jogaveis: true, alvos: true, terrenos: true, avisos: true, pagarAuto: true } }));
    }
  });
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
  const ctx = await navegador.newContext({ viewport: { width: 1920, height: 1080 } });
  ctx.setDefaultTimeout(20000);
  await comAuxilios(ctx);
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
  // a carta sob o mouse sobe e cresce de leve, e as vizinhas se afastam
  await p.locator('.leque .carta').nth(3).hover();
  await foto(p, '04b-mulligan-hover');
  await p.mouse.move(5, 500);
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
  // o ajuste manual só vale com prioridade (a partida pode ter andado durante os menus)
  await jogarAteMinhaPrioridade(p, 80);
  await p.getByRole('button', { name: 'Ajuste manual' }).click();
  await foto(p, '08-ajuste-manual');
  await p.getByRole('button', { name: 'Criar ficha' }).click();
  await foto(p, '09-ajuste-ficha');
  await p.getByRole('button', { name: 'Fechar' }).click();
  await p.getByRole('button', { name: 'Paradas' }).click();
  await conferirJanela(p, 'paradas');
  await foto(p, '10-paradas');
  await p.keyboard.press('Escape');
  // janela da barra lateral com a barra recolhida (antes cortava a mesa e deixava uma faixa preta)
  await p.getByRole('button', { name: 'Recolher a barra' }).click();
  await p.waitForTimeout(400);
  await conferirMesa(p, 'barra recolhida');
  await p.getByRole('button', { name: 'Ajuste manual' }).click();
  await conferirJanela(p, 'ajuste manual com a barra recolhida');
  await conferirMesa(p, 'ajuste manual com a barra recolhida');
  await foto(p, '10b-janela-barra-recolhida-1920');
  await p.mouse.click(12, 1068);
  await p.getByRole('button', { name: 'Abrir a barra' }).click();
  await p.waitForTimeout(400);
  await conferirMesa(p, 'barra aberta de novo');
  // efeito de ganhar vida: ajuste manual de +3 na própria vida
  await jogarAteMinhaPrioridade(p, 80);
  await p.getByRole('button', { name: 'Ajuste manual' }).click();
  await p.locator('.janela-caixa .aba').filter({ hasText: 'Vida' }).click();
  for (let k = 0; k < 3; k++) await p.locator('.janela-caixa').getByRole('button', { name: '+', exact: true }).click();
  await p.locator('.janela-caixa').getByRole('button', { name: 'Ganhar 3' }).click();
  await p.locator('.numero-efeito.vida').waitFor({ timeout: 10000 });
  await p.waitForTimeout(250);
  await p.screenshot({ path: join(SAIDA, '25b-vida.png') });
  console.log('captura: 25b-vida.png');
  // Configurações › Auxílios: Mesa real e Completo, trocados no meio da partida
  await jogarAteMinhaPrioridade(p, 80);
  await p.getByRole('button', { name: 'Configurações' }).click();
  await p.getByRole('radio', { name: /Mesa real/ }).click();
  await conferirJanela(p, 'configurações › auxílios');
  await foto(p, '20-config-auxilios');
  await p.keyboard.press('Escape');
  await p.mouse.move(5, 500);
  if (await p.locator('.realce-acao').count()) throw new Error('mesa real com carta brilhando');
  await foto(p, '21-mesa-real');
  await p.getByRole('button', { name: 'Configurações' }).click();
  await p.getByRole('radio', { name: /Completo/ }).click();
  await p.keyboard.press('Escape');
  await p.mouse.move(5, 500);
  await foto(p, '21b-mesa-completo');
  // de volta a todos os auxílios ligados (o resto do roteiro acha as jogadas pelo brilho e paga sozinho)
  await p.getByRole('button', { name: 'Configurações' }).click();
  await p.getByRole('radio', { name: /Personalizado/ }).click();
  await p.locator('#aux-pagarAuto').check();
  await p.keyboard.press('Escape');
  // algumas voltas da mesa com os bots
  await jogarUmPouco(p, 24);
  await jogarAteMinhaPrioridade(p, 80);
  await foto(p, '11-mesa-depois');
  // com prioridade, clicar numa fonte de mana gera a mana: a reserva aparece do lado da vida
  const fontes = p.locator('.area-eu .campo .carta.realce-acao');
  for (let i = await fontes.count() - 1; i >= 0; i--) {
    await fontes.nth(i).click({ timeout: 3000 }).catch(() => {});
    const adicionar = p.locator('.menu-acoes').getByRole('menuitem', { name: /adicionar/ }).first();
    if (await adicionar.isVisible().catch(() => false)) await adicionar.click({ timeout: 3000 }).catch(() => {});
    else await p.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click({ timeout: 2000 }).catch(() => {});
    if (await p.locator('.area-eu .selo.reserva').isVisible().catch(() => false)) {
      await p.mouse.move(5, 500);
      await foto(p, '11d-reserva');
      break;
    }
  }
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
  await p.waitForTimeout(400);
  await conferirMesa(p, 'mesa recolhida');
  await foto(p, '11b-mesa-recolhida-1920');
  await p.getByRole('button', { name: 'Abrir a barra' }).click();
  await p.locator('.botao-zona').first().click();
  await foto(p, '12-cemiterio');
  await ctx.close();

  // ---------------- um contra um, tela menor
  const ctx2 = await navegador.newContext({ viewport: { width: 1280, height: 800 } });
  ctx2.setDefaultTimeout(20000);
  await comAuxilios(ctx2);
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
  await q.getByRole('button', { name: 'Recolher a barra' }).click();
  await q.waitForTimeout(400);
  await conferirMesa(q, 'duelo recolhido');
  await foto(q, '14b-duelo-recolhida-1280');
  await q.getByRole('button', { name: 'Configurações' }).click();
  await conferirJanela(q, 'configurações no duelo');
  await conferirMesa(q, 'configurações no duelo');
  await foto(q, '14c-janela-1280');
  await q.locator('.janela-x').click();
  await q.getByRole('button', { name: 'Abrir a barra' }).click();
  await ctx2.close();

  // ---------------- fase 8: sala sem auxílios entre duas pessoas, e o desfazer com aceite
  const pessoa = async (nome: string) => {
    const c = await navegador.newContext({ viewport: { width: 1600, height: 900 } });
    c.setDefaultTimeout(20000);
    const pg = await c.newPage();
    await entrar(pg);
    await pg.getByLabel('Seu nome na mesa').fill(nome);
    return pg;
  };
  const ana = await pessoa('Ana');
  await ana.getByRole('button', { name: 'Um contra um' }).click();
  await ana.locator('form').filter({ hasText: 'Criar sala' }).getByLabel('Senha da sala').fill('mesa');
  await ana.getByRole('button', { name: 'Criar', exact: true }).click();
  await ana.getByRole('heading', { name: 'Lugares' }).waitFor();
  const codigo = (await ana.locator('.sala-codigo').textContent())!.replace('Sala', '').trim();
  await ana.getByRole('radio', { name: /^Proibidos/ }).click();
  await ana.locator('.deck').nth(0).click();
  const bruno = await pessoa('Bruno');
  const entrarNaSala = bruno.locator('form').filter({ hasText: 'Entrar numa sala' });
  await entrarNaSala.getByLabel('Código').fill(codigo);
  await entrarNaSala.getByLabel('Senha da sala').fill('mesa');
  await entrarNaSala.getByRole('button', { name: 'Entrar' }).click();
  await bruno.getByRole('heading', { name: 'Lugares' }).waitFor();
  await bruno.locator('.deck').nth(3).click();
  await foto(bruno, '27-saguao-auxilios-proibidos');
  await ana.getByRole('button', { name: 'Começar a partida' }).click();
  await ana.getByText('Mão inicial').waitFor();
  // a mão inicial é decidida um de cada vez
  for (let k = 0; k < 40 && (await ana.getByText('Mão inicial').isVisible() || await bruno.getByText('Mão inicial').isVisible()); k++) {
    for (const pg of [ana, bruno]) await pg.getByRole('button', { name: 'Manter' }).click({ timeout: 500 }).catch(() => {});
    await ana.waitForTimeout(250);
  }
  await ana.waitForTimeout(800);
  await ana.getByRole('button', { name: 'Configurações' }).click();
  await conferirJanela(ana, 'configurações travadas pela sala');
  await foto(ana, '28-config-travada');
  await ana.keyboard.press('Escape');
  // quem está no próprio turno joga um terreno (pelo clique direito: na mesa real nada brilha)
  const jogarTerreno = async (pg: Page) => {
    const cartas = pg.locator('.mao-cartas .carta');
    for (let i = 0; i < await cartas.count(); i++) {
      await cartas.nth(i).click({ button: 'right', position: { x: 8, y: 40 }, timeout: 3000 }).catch(() => {});
      const jogar = pg.locator('.menu-acoes .menu-item.acao').filter({ hasText: /^Jogar / }).first();
      if (await jogar.isVisible().catch(() => false)) { await jogar.click(); return true; }
      await pg.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click({ timeout: 800 }).catch(() => {});
    }
    return false;
  };
  let quem: Page | null = null;
  for (let k = 0; k < 60 && !quem; k++) {
    for (const pg of [ana, bruno]) {
      if (!await pg.getByText('Você tem prioridade').isVisible().catch(() => false)) continue;
      if (await pg.locator('.area-eu .selo.turno').isVisible().catch(() => false) && await jogarTerreno(pg)) { quem = pg; break; }
      await pg.getByRole('button', { name: 'Passar', exact: true }).click().catch(() => {});
    }
    await ana.waitForTimeout(300);
  }
  if (!quem) throw new Error('ninguém jogou um terreno para desfazer');
  const outro = quem === ana ? bruno : ana;
  await quem.waitForTimeout(700);
  await quem.locator('.fases-acao .desfazer').click();
  await outro.locator('.pedido-desfazer').waitFor();
  await foto(outro, '29-desfazer-pedido');
  await foto(quem, '29b-desfazer-esperando');
  await outro.getByRole('button', { name: 'Aceitar' }).click();
  await quem.locator('.pedido-desfazer').waitFor({ state: 'detached' });
  await foto(quem, '29c-desfeito');
  await ana.context().close();
  await bruno.context().close();

  // ---------------- fase 8: combate por cliques (salas prontas de ferramentas/cenarios.ts)
  const sala = async (cod: string) => {
    const c = await navegador.newContext({ viewport: { width: 1600, height: 900 } });
    c.setDefaultTimeout(20000);
    const pg = await c.newPage();
    paginas.push(pg);
    pg.on('pageerror', (e) => console.error(`[navegador] ${e.message}`));
    await pg.goto(URL);
    await pg.evaluate((k) => localStorage.setItem('commander-da-mesa:sala', JSON.stringify({ codigo: k, token: `token-${k}` })), cod);
    await pg.getByLabel('Senha do servidor').fill('teste-capturas');
    await pg.getByRole('button', { name: 'Entrar' }).click();
    await pg.locator('.mesa').waitFor();
    await pg.waitForTimeout(1200);
    return pg;
  };
  const ataque = await sala('ATACA');
  const minhas = ataque.locator('.area-eu .campo .carta');
  // marca a primeira criatura que pode atacar: inclina e fica esperando o alvo (4 jogadores)
  for (let i = 0; i < await minhas.count(); i++) {
    await minhas.nth(i).click({ force: true });
    await ataque.waitForTimeout(150);
    if (await ataque.locator('.area-eu .carta.inclinada').count()) break;
  }
  await ataque.mouse.move(5, 450);
  await foto(ataque, '30-ataque-marcado');
  // clica no oponente do meio: a seta aparece; a próxima marcada vai no mesmo oponente
  await ataque.locator('.area-oponente').nth(1).click({ position: { x: 200, y: 110 } });
  for (let i = await minhas.count() - 1; i >= 0; i--) {
    if (await minhas.nth(i).evaluate((e) => e.classList.contains('inclinada'))) continue;
    await minhas.nth(i).click({ force: true });
    await ataque.waitForTimeout(150);
    if (await ataque.locator('.area-eu .carta.inclinada').count() >= 2) break;
  }
  await ataque.mouse.move(5, 450);
  await foto(ataque, '30b-ataque-com-alvo');
  await ataque.context().close();

  const bloqueio = await sala('BLOQU');
  const meus = bloqueio.locator('.area-eu .campo .carta');
  for (let i = 0; i < await meus.count(); i++) {
    await meus.nth(i).click({ force: true });
    await bloqueio.waitForTimeout(150);
    if (await bloqueio.locator('.area-eu .carta.combate-ativa').count()) {
      await bloqueio.locator('.area-oponente .campo .carta:has(.selo-combate)').first().click({ force: true });
      await bloqueio.waitForTimeout(300);
      if (await bloqueio.locator('.area-eu .selo-combate.escudo').count()) break;
    }
  }
  await bloqueio.mouse.move(5, 450);
  await foto(bloqueio, '31-bloqueio');
  await bloqueio.getByRole('button', { name: /Confirmar bloqueio|Não bloquear/ }).click();
  await bloqueio.locator('.numero-efeito').first().waitFor({ timeout: 15000 });
  await bloqueio.waitForTimeout(200);
  await bloqueio.screenshot({ path: join(SAIDA, '31b-dano.png') });
  console.log('captura: 31b-dano.png');
  await bloqueio.context().close();

} catch (e) {
  for (const [i, p] of paginas.entries()) if (!p.isClosed()) await p.screenshot({ path: join(SAIDA, `falha-${i}.png`) }).catch(() => {});
  throw e;
} finally {
  await navegador.close();
  servidor.kill();
}
