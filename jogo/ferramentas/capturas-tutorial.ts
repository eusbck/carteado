// Capturas e conferência do Como jogar (cliente/src/tutorial) num navegador automatizado. Sobe um servidor temporário
// (porta e dados próprios, longe da mesa de verdade), abre o tutorial pela tela inicial, pelo saguão e pelo menu da
// mesa, rola passo a passo e fotografa cada cena em tela larga e de celular, em português e em inglês.
// Uso: npm run cliente:build && node ferramentas/capturas-tutorial.ts   → imagens em .cache/capturas-tutorial/

import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from 'playwright';
import { Banco } from '../servidor/banco.ts';
import { gerarSalasMesa } from './cenarios.ts';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = join(RAIZ, '.cache', 'capturas-tutorial');
const DADOS = join(RAIZ, '.cache', 'capturas-tutorial-dados');
const PORTA = Number(process.env.PORTA_CAPTURAS ?? 8093);
const URL = `http://localhost:${PORTA}`;
const SENHA = 'teste-capturas';

rmSync(DADOS, { recursive: true, force: true });
rmSync(SAIDA, { recursive: true, force: true });
mkdirSync(SAIDA, { recursive: true });
// uma sala pronta (MESA1) para abrir o tutorial pelo menu da mesa
{ const banco = new Banco(join(DADOS, 'jogo.sqlite')); gerarSalasMesa(banco); banco.fechar(); }

const servidor = spawn(process.execPath, [join(RAIZ, 'servidor', 'index.ts')], { env: { ...process.env, PORTA: String(PORTA), DADOS, SENHA_ACESSO: SENHA }, stdio: ['ignore', 'pipe', 'pipe'] });
servidor.stderr.on('data', (d) => process.stderr.write(`[servidor] ${d}`));
await new Promise<void>((ok, falha) => {
  const t = setTimeout(() => falha(new Error('servidor não subiu')), 120000);
  servidor.stdout.on('data', (d) => { if (String(d).includes('http://localhost')) { clearTimeout(t); ok(); } });
});

const navegador = await chromium.launch();
const erros: string[] = [];
const ouvir = (p: Page) => {
  p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  p.on('pageerror', (e) => erros.push(e.message));
};
const foto = async (p: Page, nome: string) => { await p.screenshot({ path: join(SAIDA, `${nome}.png`) }); console.log(`captura: ${nome}.png`); };
const exigir = (ok: unknown, msg: string) => { if (!ok) throw new Error(msg); };

async function entrar(p: Page): Promise<void> {
  ouvir(p);
  await p.goto(URL);
  await p.getByLabel('Senha do servidor').fill(SENHA);
  await p.getByRole('button', { name: 'Entrar' }).click();
}

/** as imagens das cartas do palco chegaram (as miniaturas são geradas no primeiro pedido) */
const imagensProntas = (p: Page) => p.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('.tut img')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 60000 });

/** rola até cada passo, espera a cena terminar e fotografa; devolve as cenas vistas, na ordem */
async function percorrer(p: Page, prefixo: string): Promise<string[]> {
  const cenas = await p.locator('[data-cena]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.cena!));
  const vistas: string[] = [];
  for (const [n, cena] of cenas.entries()) {
    await p.locator(`[data-cena="${cena}"]`).evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await p.locator(`[data-cena="${cena}"].ativo`).waitFor({ timeout: 5000 });
    // a cena mais longa leva uns 3,5 s para chegar ao último quadro
    await p.waitForTimeout(4300);
    vistas.push(cena);
    await foto(p, `${prefixo}-${String(n + 1).padStart(2, '0')}-${cena}`);
  }
  return vistas;
}

try {
  // ---------------------------------------------------------------- tela larga, pela tela inicial
  const largo = await navegador.newContext({ viewport: { width: 1440, height: 900 } });
  largo.setDefaultTimeout(20000);
  const p = await largo.newPage();
  await entrar(p);
  await p.locator('.tela-passos').waitFor();
  await foto(p, '00-inicio-com-o-botao');
  const botao = p.getByRole('button', { name: 'Como jogar' });
  await botao.click();
  await p.locator('.tut').waitFor();
  await imagensProntas(p);
  await p.waitForTimeout(500);
  await foto(p, '01-abertura');

  // como ler uma carta: os seis pontos abrem o texto de cada parte
  await p.locator('.tut-ler').evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await p.waitForTimeout(400);
  await foto(p, '02-ler-carta');
  const pontos = p.locator('.tut-ponto');
  exigir(await pontos.count() === 6, 'a carta de exemplo não tem seis pontos');
  for (let i = 0; i < 6; i++) {
    await pontos.nth(i).click();
    exigir(await p.locator('.tut-partes li.ativo p').count() === 1, `o ponto ${i + 1} não abriu o texto`);
  }
  await pontos.nth(1).click();
  await p.waitForTimeout(350);
  await foto(p, '03-ler-carta-custo');

  const cenasPt = await percorrer(p, 'pt');
  exigir(cenasPt.length === 20, `esperava 20 passos, vi ${cenasPt.length}`);

  // a trilha leva ao capítulo
  await p.locator('.tut-trilha button').nth(3).click();
  await p.waitForTimeout(1500);
  exigir(await p.locator('.tut-trilha button.atual').getAttribute('aria-label').then((x) => x?.startsWith('4.')), 'a trilha não levou ao capítulo 4');

  // fechamento
  await p.locator('.tut-fim').evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await p.waitForTimeout(400);
  await foto(p, '04-fim');

  // inglês: troca na hora e fica guardado
  await p.getByRole('button', { name: 'EN', exact: true }).click();
  exigir(await p.locator('.tut').getAttribute('lang') === 'en', 'o idioma não mudou para inglês');
  await p.locator('.tut-abertura').evaluate((e) => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await p.waitForTimeout(400);
  await foto(p, '05-en-abertura');
  for (const cena of ['terrenos', 'dano', 'taxa']) {
    await p.locator(`[data-cena="${cena}"]`).evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await p.waitForTimeout(4300);
    await foto(p, `en-${cena}`);
  }

  // Esc fecha e o foco volta para o botão que abriu
  await p.keyboard.press('Escape');
  await p.locator('.tut').waitFor({ state: 'detached' });
  exigir(await botao.evaluate((b) => document.activeElement === b), 'o foco não voltou para o botão Como jogar');
  // reabrindo, continua em inglês; o X fecha
  await botao.click();
  await p.locator('.tut').waitFor();
  exigir(await p.locator('.tut').getAttribute('lang') === 'en', 'o idioma não ficou guardado');
  await p.getByRole('button', { name: 'PT', exact: true }).click();
  await p.locator('.tut .janela-x').click();
  await p.locator('.tut').waitFor({ state: 'detached' });

  // ---------------------------------------------------------------- pelo saguão
  await p.getByLabel('Seu nome na mesa').fill('Ana');
  await p.getByRole('button', { name: 'Continuar' }).click();
  await p.getByRole('button', { name: /^Criar sala/ }).click();
  const criar = p.locator('form').filter({ hasText: 'Criar sala' });
  await criar.locator('input[type="password"]').fill('sala-teste');
  await criar.getByRole('button', { name: 'Criar', exact: true }).click();
  await p.locator('.saguao-topo').waitFor();
  await foto(p, '06-saguao-com-o-botao');
  await p.locator('.saguao-topo').getByRole('button', { name: 'Como jogar' }).click();
  await p.locator('.tut').waitFor();
  await p.keyboard.press('Escape');
  await p.locator('.tut').waitFor({ state: 'detached' });
  await largo.close();

  // ---------------------------------------------------------------- pelo menu da mesa
  const naMesa = await navegador.newContext({ viewport: { width: 1440, height: 900 } });
  naMesa.setDefaultTimeout(20000);
  const m = await naMesa.newPage();
  ouvir(m);
  await m.goto(URL);
  await m.evaluate(() => localStorage.setItem('commander-da-mesa:sala', JSON.stringify({ codigo: 'MESA1', token: 'token-MESA1' })));
  await m.getByLabel('Senha do servidor').fill(SENHA);
  await m.getByRole('button', { name: 'Entrar' }).click();
  await m.locator('.mesa').waitFor();
  await m.getByText('Você tem prioridade').waitFor({ timeout: 90000 });
  await m.waitForTimeout(600);
  await foto(m, '07-mesa-com-o-botao');
  await m.locator('.menu-lateral').getByRole('button', { name: 'Como jogar' }).click();
  await m.locator('.tut').waitFor();
  await imagensProntas(m);
  await m.locator('[data-cena="bloqueadores"]').evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await m.waitForTimeout(2500);
  await foto(m, '08-mesa-tutorial-aberto');
  // o Espaço rola o tutorial e não chega aos atalhos da mesa
  await m.keyboard.press('Space');
  await m.waitForTimeout(500);
  await m.keyboard.press('Escape');
  await m.locator('.tut').waitFor({ state: 'detached' });
  exigir(await m.getByText('Você tem prioridade').count() > 0, 'a mesa mudou com o tutorial aberto');
  await naMesa.close();

  // ---------------------------------------------------------------- celular
  const celular = await navegador.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  celular.setDefaultTimeout(20000);
  const c = await celular.newPage();
  await entrar(c);
  await c.locator('.tela-passos').waitFor();
  await c.getByRole('button', { name: 'Como jogar' }).click();
  await c.locator('.tut').waitFor();
  await imagensProntas(c);
  await c.waitForTimeout(500);
  await foto(c, 'cel-00-abertura');
  await c.locator('.tut-ler').evaluate((e) => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await c.locator('.tut-ponto').nth(5).click();
  await c.waitForTimeout(400);
  await foto(c, 'cel-01-ler-carta');
  const cenasCel = await percorrer(c, 'cel');
  exigir(cenasCel.length === 20, `celular: esperava 20 passos, vi ${cenasCel.length}`);
  exigir(await c.evaluate(() => document.querySelector('.tut-rolagem')!.scrollWidth <= document.querySelector('.tut-rolagem')!.clientWidth), 'celular: a página rola para o lado');
  await celular.close();

  // ---------------------------------------------------------------- menos movimento: a cena já aparece pronta
  const calmo = await navegador.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  calmo.setDefaultTimeout(20000);
  const r = await calmo.newPage();
  await entrar(r);
  await r.locator('.tela-passos').waitFor();
  await r.getByRole('button', { name: 'Como jogar' }).click();
  await r.locator('.tut').waitFor();
  await imagensProntas(r);
  await r.locator('[data-cena="dano"]').evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await r.waitForTimeout(350);
  exigir(await r.locator('.tut-marca.dano').count() === 1, 'menos movimento: a cena do dano não apareceu pronta');
  await foto(r, 'calmo-dano');
  await calmo.close();

  exigir(erros.length === 0, `erros no navegador:\n${erros.join('\n')}`);
  console.log('Como jogar: tudo conferido.');
} finally {
  await navegador.close();
  servidor.kill();
}
