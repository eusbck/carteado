// Prepara o plano e instala os assets gerados pela ferramenta interna de imagens.
// Não chama APIs de geração. Os PNGs originais e os prompts ficam no projeto.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const pasta = join(raiz, 'artes-comandantes');
const gerados = join(pasta, 'gerados');
const manifesto = join(gerados, 'manifesto.json');
const configuracao = [
  [9, 'jin-sakai', "Jin's Vengeance", 'Jin Sakai', '#d44b40'],
  [10, 'sauron', 'The Hosts of Mordor', 'Sauron', '#e76528'],
  [11, 'doctor-doom', 'Doom Prevails', 'Doctor Doom', '#62c779'],
  [12, 'black-panther', 'Wakanda Forever', "T'Challa", '#ab7fea'],
  [13, 'leonardo', 'Turtle Power!', 'Leonardo', '#56a7f0'],
  [14, 'hatsune-miku', 'Hatsune Miku', 'Hatsune Miku', '#51d9cf'],
  [15, 'invisible-woman', "The Fantastic Four Collector's Edition", 'Invisible Woman', '#6ccdfa'],
  [16, 'lathliss', 'Reign of Dragons', 'Lathliss', '#ef713b'],
  [17, 'rin-seri', 'Raining Cats and Dogs', 'Rin e Seri', '#d6bb76'],
  [18, 'anhelo', 'Maestros Massacre', 'Anhelo', '#b570e2'],
  [19, 'szarekh', 'Necron Dynasties', 'Szarekh', '#87d944'],
  [20, 'strefan', 'Vampiric Bloodline', 'Strefan', '#cb4f64'],
  [21, 'captain-america', "Avengers Assemble Collector's Edition", 'Captain America', '#68a3e3'],
  [22, 'sai', 'Keen Engineering', 'Sai', '#57c1de'],
  [23, 'yennett', 'Odd and Ends', 'Yennett', '#c898ec'],
  [24, 'kaalia', 'Heavenly Inferno', 'Kaalia', '#e08b61'],
  [25, 'timey-wimey', 'Timey-Wimey', 'Décimo Doutor e Rose', '#738de9'],
  [26, 'food-and-fellowship', 'Food and Fellowship', 'Frodo e Sam', '#b6bd70'],
];

const ler = (arquivo) => JSON.parse(readFileSync(arquivo, 'utf8'));
const salvar = (dados) => writeFileSync(manifesto, `${JSON.stringify(dados, null, 2)}\n`);
const [acao = 'plan', id, tipo, entrada] = process.argv.slice(2);

if (acao === 'plan') {
  const indice = ler(join(pasta, 'indice.json'));
  const anterior = existsSync(manifesto) ? ler(manifesto) : null;
  const assets = configuracao.map(([ordem, id, deck, nome, aura]) => {
    const fontes = indice.filter((a) => a.ordem === ordem);
    const moxfield = fontes.find((a) => a.arquivo.includes('arte do Moxfield'));
    // Miku é a identidade visual do deck; as outras variantes mantêm a arte do jogo.
    const referencias = ordem === 14 ? [moxfield] : fontes.filter((a) => !a.arquivo.includes('arte do Moxfield'));
    const velho = anterior?.assets.find((a) => a.id === id);
    return {
      ordem, id, deck, nome, aura,
      comandantes: [...new Set(fontes.map((a) => a.comandante))],
      imagensNoJogo: [...new Set(fontes.map((a) => a.idImagem))],
      referencias: referencias.map((a) => ({ arquivo: `artes-comandantes/${a.arquivo}`, comandante: a.comandante, artista: a.artista })),
      banner: velho?.banner ?? null,
      icone: velho?.icone ?? null,
    };
  });
  mkdirSync(gerados, { recursive: true });
  salvar({ ferramenta: 'image_gen interna', modeloSolicitado: 'GPT IMAGE 2', data: '2026-10-11', assets, pendencias: anterior?.pendencias ?? [] });
  console.log(JSON.stringify(assets.map((a) => ({ id: a.id, deck: a.deck, referencias: a.referencias, imagensNoJogo: a.imagensNoJogo })), null, 2));
} else if (acao === 'import') {
  if (!id || !['banner', 'icone'].includes(tipo) || !entrada) throw new Error('Uso: import <id> banner|icone <PNG gerado>');
  const dados = ler(manifesto);
  const a = dados.assets.find((a) => a.id === id);
  if (!a) throw new Error(`Asset desconhecido: ${id}`);
  const origem = isAbsolute(entrada) ? entrada : resolve(raiz, entrada);
  const original = join(gerados, `${id}-${tipo}.png`);
  mkdirSync(gerados, { recursive: true });
  if (origem !== original) copyFileSync(origem, original);
  const meta = await sharp(original).metadata();
  const destinos = [];
  if (tipo === 'banner') {
    const buffer = await sharp(original).webp({ quality: 90, effort: 6 }).toBuffer();
    const fontesArquivo = join(raiz, 'jogo/gerado/fundos/fontes.json');
    const fontes = ler(fontesArquivo);
    const imagens = ler(join(raiz, 'jogo/gerado/imagens.json'));
    const indice = ler(join(pasta, 'indice.json'));
    for (const imagem of a.imagensNoJogo) {
      const relativo = `jogo/gerado/fundos/${imagem}.webp`;
      writeFileSync(join(raiz, relativo), buffer);
      destinos.push(relativo);
    }
    for (const comandante of a.comandantes) {
      const i = imagens[comandante];
      const usada = (i?.pt && !i.pt.reserva ? i.pt : i?.en)?.id;
      const imagem = usada ?? indice.find((f) => f.ordem === a.ordem && f.comandante === comandante && !f.arquivo.includes('arte do Moxfield'))?.idImagem ?? a.imagensNoJogo[0];
      fontes[comandante] = { deck: a.deck, imagem, imagens: a.imagensNoJogo, original: `artes-comandantes/gerados/${a.id}-banner.png`, referencias: a.referencias.map((r) => r.arquivo), ferramenta: dados.ferramenta, modeloSolicitado: dados.modeloSolicitado, tamanho: [meta.width, meta.height], bytes: buffer.length };
    }
    writeFileSync(fontesArquivo, `${JSON.stringify(fontes, null, 1)}\n`);
  } else {
    if (!meta.hasAlpha) throw new Error(`${id}: o ícone precisa de transparência real`);
    const estatisticas = await sharp(original).stats();
    if (estatisticas.channels.at(-1).min !== 0) throw new Error(`${id}: o fundo do ícone precisa ter pixels transparentes`);
    const diretorio = join(raiz, 'jogo/cliente/src/imagens/avatares');
    const grande = await sharp(original).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ nearLossless: true, quality: 80, effort: 6 }).toBuffer();
    mkdirSync(join(diretorio, 'mesa'), { recursive: true });
    writeFileSync(join(diretorio, `${id}.webp`), grande);
    const { data, info } = await sharp(grande).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const lado = 256, pixels = Buffer.alloc(lado * lado * 4);
    for (let y = 0; y < lado; y++) for (let x = 0; x < lado; x++) {
      let r = 0, g = 0, b = 0, alfa = 0;
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
        const k = ((2 * y + dy) * info.width + 2 * x + dx) * 4;
        const al = data[k + 3];
        r += data[k] * al; g += data[k + 1] * al; b += data[k + 2] * al; alfa += al;
      }
      const k = (y * lado + x) * 4;
      pixels[k + 3] = Math.round(alfa / 4);
      if (alfa) { pixels[k] = Math.round(r / alfa); pixels[k + 1] = Math.round(g / alfa); pixels[k + 2] = Math.round(b / alfa); }
    }
    await sharp(pixels, { raw: { width: lado, height: lado, channels: 4 } }).webp({ nearLossless: true, quality: 60, effort: 6 }).toFile(join(diretorio, 'mesa', `${id}.webp`));
    destinos.push(`jogo/cliente/src/imagens/avatares/${id}.webp`, `jogo/cliente/src/imagens/avatares/mesa/${id}.webp`);
  }
  const promptArquivo = join(gerados, `${id}-${tipo}.txt`);
  a[tipo] = { original: `artes-comandantes/gerados/${id}-${tipo}.png`, tamanhoOriginal: [meta.width, meta.height], destinos, prompt: existsSync(promptArquivo) ? readFileSync(promptArquivo, 'utf8') : null };
  salvar(dados);
  console.log(JSON.stringify({ id, tipo, tamanhoOriginal: [meta.width, meta.height], destinos }));
} else if (acao === 'gallery') {
  const dados = ler(manifesto);
  const pendenciasArquivo = join(gerados, 'pendencias.json');
  if (existsSync(pendenciasArquivo)) {
    const pendencias = ler(pendenciasArquivo);
    dados.pendencias = pendencias.artes;
    dados.decisaoUsuario = pendencias.decisaoUsuario;
    salvar(dados);
  }
  const estiloJogo = readFileSync(join(raiz, 'jogo/cliente/src/estilo.css'), 'utf8');
  const inicioAvatar = estiloJogo.indexOf('/* ---------------------------------------------------------------- avatar na mesa');
  const fimAvatar = estiloJogo.indexOf('/* escolha do retrato', inicioAvatar);
  const cssAvatar = estiloJogo.slice(inicioAvatar, fimAvatar);
  const escapar = (texto) => texto.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  const rel = (arquivo) => `../../${arquivo}`;
  const cards = dados.assets.map((a) => {
    const banner = a.banner ? `<a class="banner-link" href="${a.id}-banner.png" target="_blank"><img class="banner" src="${rel(a.banner.destinos[0])}" alt="Banner de ${escapar(a.deck)}"></a>` : '<div class="pendente">Banner pendente</div>';
    const icone = a.icone ? `<div class="original"><a href="${a.id}-icone.png" target="_blank"><img src="${rel(a.icone.destinos[0])}" alt="Retrato de ${escapar(a.nome)}"></a></div><div class="miniatura"><div class="avatar avatar-local pronto" style="--tam:80px;--aura:${a.aura};--cor:#e2b866"><span class="avatar-aura"></span><span class="avatar-fundo"></span><img class="avatar-retrato avatar-dentro" src="${rel(a.icone.destinos[1])}" alt=""><span class="avatar-anel"></span><img class="avatar-retrato avatar-fora" src="${rel(a.icone.destinos[1])}" alt=""><button class="vida-n avatar-vida" disabled>40</button></div><small>Na mesa</small></div>` : '<div class="pendente icone-pendente">Ícone pendente</div>';
    return `<article class="card" data-id="${a.id}" data-busca="${escapar(`${a.deck} ${a.nome}`.toLowerCase())}"><header><h2>${escapar(a.deck)}</h2><p>${escapar(a.nome)}</p></header>${banner}<div class="retratos-card">${icone}</div><footer><a href="${a.id}-banner.png" target="_blank" ${a.banner ? '' : 'hidden'}>Abrir banner</a><a href="${a.id}-icone.png" target="_blank" ${a.icone ? '' : 'hidden'}>Abrir ícone</a></footer></article>`;
  }).join('\n');
  const completos = dados.assets.filter((a) => a.banner && a.icone).length;
  const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Artes dos comandantes</title><style>
  *{box-sizing:border-box}body{margin:0;padding:32px;background:#0d0c0e;color:#f0e9db;font-family:Segoe UI,Arial,sans-serif}h1{margin:0 0 8px;font-family:Georgia,serif;font-size:36px}.subtitulo{color:#b8aead;margin:0 0 24px}input{border:1px solid #4b413d;border-radius:10px;background:#19161a;color:#f0e9db;padding:12px 16px;width:min(400px,100%);font:inherit;margin-bottom:24px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.card{border:1px solid #4c3a2b;background:#18151a;border-radius:16px;overflow:hidden}.card>header{padding:16px 18px;height:84px}.card h2{font-family:Georgia,serif;font-size:20px;margin:0 0 5px}.card p{font-size:13px;color:#b8aead;margin:0}.banner-link{display:block}.banner{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}.retratos-card{display:flex;align-items:center;justify-content:space-evenly;padding:20px;height:160px;background:radial-gradient(ellipse at top,#28222c,#141115)}.original{width:124px;height:124px;border-radius:10px;background:repeating-conic-gradient(#28252b 0% 25%,#1c191f 0% 50%) 50%/16px 16px}.original img{width:100%;height:100%;object-fit:contain}.miniatura{height:124px;display:flex;flex-direction:column;gap:25px;align-items:center;padding-top:10px}.miniatura small{font-size:11px;color:#b8aead}.card footer{padding:12px 18px;display:flex;gap:20px;border-top:1px solid #382d2a}a{color:#e2b866;font-size:13px}.pendente{display:grid;place-items:center;aspect-ratio:16/9;color:#c2a075;background:#201b22}.icone-pendente{height:124px;aspect-ratio:auto}.card[hidden]{display:none}
  ${cssAvatar}
  .miniatura .avatar{position:relative;inset:auto;translate:none;animation:none;filter:drop-shadow(0 4px 8px #0009)}.avatar-aura{animation:none}.avatar-vida{font-family:Georgia,serif}
  @media(max-width:1000px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:640px){body{padding:18px}.grid{grid-template-columns:1fr}h1{font-size:30px}}
  </style><h1>Artes dos comandantes</h1><p class="subtitulo">${completos} de ${dados.assets.length} decks com banner e ícone · Clique nas artes para abrir os originais.</p><input type="search" placeholder="Buscar deck ou comandante" aria-label="Buscar deck ou comandante"><main class="grid">${cards}</main><script>document.querySelector('input').addEventListener('input',event=>{const busca=event.target.value.toLowerCase();document.querySelectorAll('.card').forEach(card=>card.hidden=!card.dataset.busca.includes(busca))})</script></html>`;
  const arquivo = join(gerados, 'galeria.html');
  writeFileSync(arquivo, html);
  const imagens = ler(join(raiz, 'jogo/gerado/imagens.json'));
  const relatorio = [];
  for (const a of dados.assets) {
    const item = { id: a.id, deck: a.deck, completo: !!a.banner && !!a.icone, banner: null, icones: [], imagensAtuais: [] };
    if (a.banner) {
      const m = await sharp(join(raiz, a.banner.destinos[0])).metadata();
      item.banner = { largura: m.width, altura: m.height, proporcao: m.width / m.height, variantes: a.banner.destinos.length };
    }
    if (a.icone) for (const destino of a.icone.destinos) {
      const m = await sharp(join(raiz, destino)).metadata();
      const s = await sharp(join(raiz, destino)).stats();
      item.icones.push({ arquivo: destino, largura: m.width, altura: m.height, transparente: !s.isOpaque, alfa: m.hasAlpha });
    }
    for (const comandante of a.comandantes) {
      const i = imagens[comandante];
      const usada = (i?.pt && !i.pt.reserva ? i.pt : i?.en)?.id;
      if (usada) item.imagensAtuais.push({ comandante, imagem: usada, fundo: existsSync(join(raiz, `jogo/gerado/fundos/${usada}.webp`)) });
    }
    relatorio.push(item);
  }
  writeFileSync(join(gerados, 'conferencia.json'), `${JSON.stringify({ completos, total: dados.assets.length, assets: relatorio }, null, 2)}\n`);
  if (process.argv.includes('--capturar')) {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1600, height: 1050 }, deviceScaleFactor: 1 });
      await page.goto(pathToFileURL(arquivo).href);
      await page.evaluate(async () => { await Promise.all(Array.from(document.images, (img) => img.decode().catch(() => {}))); });
      await page.screenshot({ path: join(gerados, 'galeria.jpg'), fullPage: true, type: 'jpeg', quality: 90 });
      for (const id of ['food-and-fellowship', 'timey-wimey']) await page.locator(`[data-id="${id}"]`).screenshot({ path: join(gerados, `${id}-previa.png`) });
      const falhas = await page.evaluate(() => Array.from(document.images).filter((i) => !i.complete || !i.naturalWidth).map((i) => i.src));
      if (falhas.length) throw new Error(`Falha ao carregar imagens: ${falhas.join(', ')}`);
    } finally { await browser.close(); }
  }
  console.log(JSON.stringify({ galeria: arquivo, completos, total: dados.assets.length, faltam: dados.assets.filter((a) => !a.banner || !a.icone).map((a) => ({ id: a.id, banner: !!a.banner, icone: !!a.icone })), semFundoAtual: relatorio.flatMap((a) => a.imagensAtuais.filter((i) => !i.fundo)) }));
} else {
  throw new Error(`Ação desconhecida: ${acao}`);
}
