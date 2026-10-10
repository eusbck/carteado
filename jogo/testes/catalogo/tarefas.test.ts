// Importar e atualizar pelo Moxfield, de ponta a ponta, com a rede falsa e pastas temporárias:
// deck só com cartas conhecidas entra no saguão; carta nova deixa em preparação (dados, imagens, rulings e fichas
// gravados); atualização pronta troca a lista; a que espera cartas fica guardada com a lista antiga jogável. Várias
// importações juntas: cada deck uma vez, downloads ao mesmo tempo e a gravação uma de cada vez, sem perder nada.
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import '../../cartas/index.ts';
import type { DeckList } from '../../motor/state.ts';
import { Catalogo } from '../../servidor/catalogo/catalogo.ts';
import { lerNovas, lerAnterior } from '../../servidor/catalogo/gerar.ts';
import { cartaPronta } from '../../servidor/catalogo/prontidao.ts';
import { TarefasDecks, ErroOcupado } from '../../servidor/catalogo/tarefas.ts';
import { comTrava, ErroTrava } from '../../servidor/catalogo/trava.ts';
import { RotasCatalogo } from '../../servidor/catalogo/rotas.ts';
import type { Pastas } from '../../servidor/catalogo/caminhos.ts';
import decksTeste from '../decks-teste.json' with { type: 'json' };
import { cartaFalsa, pastasTemp, RedeFalsa, respostaMox, type EntradaFalsa } from './ajuda.ts';

const DECKS = decksTeste as DeckList[];
const TERRA = DECKS.find((d) => d.nome === 'Terra')!;
const ABZAN = DECKS.find((d) => d.nome === 'Abzan Armor')!;
const entradas = (d: DeckList): EntradaFalsa[] => d.cartas.map((c) => ({ nome: c.nome, quantidade: c.quantidade }));

function montar(p: Pastas = pastasTemp(), esperaTrava?: number) {
  const rede = new RedeFalsa();
  const catalogo = new Catalogo({ pasta: p.decks, pronta: cartaPronta });
  const mudancas: boolean[] = [];
  const t = new TarefasDecks({ pastas: p, rede, catalogo, pronta: cartaPronta, artes: false, esperaTrava, aoMudar: (x) => mudancas.push(x) });
  return { p, rede, catalogo, t, mudancas };
}

/** espera a condição (as tarefas em segundo plano) */
async function ate(cond: () => boolean, ms = 5000): Promise<void> {
  const fim = Date.now() + ms;
  while (!cond()) {
    if (Date.now() > fim) throw new Error('a condição não chegou');
    await new Promise((ok) => setTimeout(ok, 10));
  }
}
const terminaram = (t: TarefasDecks) => t.lista().every((x) => x.estado !== 'andando');

/** a lista de Terra com duas cartas trocadas por outras (incolores, para caber na identidade) */
function terraTrocada(novas: EntradaFalsa[]): EntradaFalsa[] {
  const sem = entradas(TERRA).filter((e) => e.nome !== 'Arcane Signet' && e.nome !== 'Thrill of Possibility');
  return [...sem, ...novas];
}

describe('importar', () => {
  it('deck só com cartas que o jogo já tem: entra no saguão na hora', async () => {
    const { p, rede, catalogo, t, mudancas } = montar();
    const ordem = catalogo.proximaOrdem();
    const antes = JSON.parse(readFileSync(join(p.gerado, 'decks.json'), 'utf8')) as DeckList[];
    rede.deck('NovoDeckConhecido1', respostaMox('NovoDeckConhecido1', 'Terra de novo', { nome: TERRA.comandante }, entradas(TERRA)));
    const prop = await t.verificar('https://moxfield.com/decks/NovoDeckConhecido1');
    expect(prop).toMatchObject({ novo: true, destino: 'jogavel', erros: [], prontas: prop.total });
    expect(rede.pedidos.filter((x) => x.includes('scryfall'))).toEqual([]);
    expect(catalogo.ler('NovoDeckConhecido1')).toBeNull(); // verificar não grava nada
    const r = await t.confirmar(prop.token);
    expect(r).toMatchObject({ id: 'NovoDeckConhecido1', destino: 'jogavel' });
    expect(mudancas).toEqual([true]);
    const d = catalogo.ler('NovoDeckConhecido1')!;
    expect(d).toMatchObject({ ordem, nome: 'Terra de novo', link: 'https://moxfield.com/decks/NovoDeckConhecido1', preparacao: null });
    expect(d.atual?.origem).toEqual({ versao: 3, atualizadoEm: '2026-10-01T12:00:00.000Z' });
    const gerados = JSON.parse(readFileSync(join(p.gerado, 'decks.json'), 'utf8')) as DeckList[];
    expect(gerados.map((x) => x.id).at(-1)).toBe('NovoDeckConhecido1');
    expect(gerados.slice(0, -1)).toEqual(antes);
    expect(gerados.slice(0, 7)).toEqual(DECKS);
    await expect(t.confirmar(prop.token)).rejects.toThrow(/venceu ou já foi usada/);
  });

  it('deck com cartas novas: fica em preparação, com dados, imagens, rulings e fichas gravados', async () => {
    const { p, rede, catalogo, t, mudancas } = montar();
    const fichasAntes = lerNovas(p.decks).fichas;
    const decksAntes = (JSON.parse(readFileSync(join(p.gerado, 'decks.json'), 'utf8')) as DeckList[]).length;
    const soldado = cartaFalsa('Soldado de Teste', { layout: 'token', type_line: 'Token Creature — Soldier', image_uris: { png: 'https://cards.scryfall.io/png/front/s/s/soldado.png' } });
    const artefato = cartaFalsa('Artefato de Teste');
    const recrutador = cartaFalsa('Recrutador de Teste', {
      type_line: 'Creature — Human', mana_cost: '{1}{R}', color_identity: ['R'], colors: ['R'], power: '2', toughness: '2', oracle_text: 'When this enters, create a 1/1 Soldier token.',
      all_parts: [{ id: soldado.id, component: 'token', name: 'Soldado de Teste' }],
    });
    const recrutadorPt = { ...recrutador, id: '99999999-0000-4000-8000-000000000001', lang: 'pt', printed_name: 'Recrutador em Português', image_status: 'lowres', image_uris: { png: 'https://cards.scryfall.io/png/front/p/t/pt.png' } };
    rede.carta(soldado, artefato, recrutador, recrutadorPt);
    rede.rulings.set(recrutador.id, [{ source: 'wotc', published_at: '2026-01-01', comment: 'Uma regra.' }]);
    rede.deck('DeckComNovas1234', respostaMox('DeckComNovas1234', 'Com cartas novas', { nome: TERRA.comandante },
      terraTrocada([{ nome: 'Artefato de Teste', scryfallId: artefato.id }, { nome: 'Recrutador de Teste', scryfallId: null }])));
    const prop = await t.verificar('DeckComNovas1234');
    expect(prop).toMatchObject({ destino: 'preparacao', erros: [], total: TERRA.cartas.length + 1, prontas: TERRA.cartas.length - 1 });
    expect(prop.faltam.map((c) => c.nome).sort()).toEqual(['Artefato de Teste', 'Recrutador de Teste']);
    expect(prop.resumo).toMatch(/2 cartas ainda não têm regras/);
    await t.confirmar(prop.token);
    expect(mudancas).toEqual([false]);
    const d = catalogo.ler('DeckComNovas1234')!;
    expect(d.atual).toBeNull();
    expect(d.preparacao?.cartas.map((c) => c.nome)).toContain('Recrutador de Teste');
    expect(catalogo.listasJogaveis().map((x) => x.id)).not.toContain('DeckComNovas1234');
    // dados das cartas novas e da ficha
    const novas = lerNovas(p.decks);
    expect(novas.escolhas['Recrutador de Teste']).toEqual({ en: recrutador.id, pt: recrutadorPt.id });
    expect(novas.fichas).toEqual([...fichasAntes, soldado.oracle_id]);
    expect(JSON.parse(readFileSync(join(p.decks, 'rulings.json'), 'utf8')).by_oracle_id[recrutador.oracle_id!]).toHaveLength(1);
    for (const id of [artefato.id, recrutador.id, recrutadorPt.id, soldado.id]) expect(existsSync(join(p.imagens, id, 'front.png')), id).toBe(true);
    // gerado/ com as cartas novas (o servidor só as carrega ao subir de novo)
    const g = lerAnterior(p.gerado);
    expect(g.cartas?.cartas['Recrutador de Teste']?.faces[0]).toMatchObject({ types: ['Creature'], power: 2 });
    expect(g.cartas?.fichas.at(-1)?.name).toBe('Soldado de Teste');
    expect(g.imagens?.['Recrutador de Teste']?.pt).toMatchObject({ nome: 'Recrutador em Português', reserva: false });
    expect(JSON.parse(readFileSync(join(p.gerado, 'decks.json'), 'utf8'))).toHaveLength(decksAntes);
    // a tela mostra o deck em preparação
    expect(catalogo.publico({ carta: () => null }).find((x) => x.id === 'DeckComNovas1234')).toMatchObject({ estado: 'preparacao', preparacao: { prontas: TERRA.cartas.length - 1 } });
  });

  it('regras de Commander: lista ilegal não pode ser confirmada', async () => {
    const { rede, t } = montar();
    rede.deck('DeckIlegal123456', respostaMox('DeckIlegal123456', 'Ilegal', { nome: TERRA.comandante }, entradas(TERRA).slice(1)));
    const prop = await t.verificar('DeckIlegal123456');
    expect(prop.erros.join(' ')).toMatch(/99 cartas/);
    expect(prop.resumo).toMatch(/não cumpre as regras/);
    await expect(t.confirmar(prop.token)).rejects.toThrow(/regras de Commander/);
  });
});

describe('atualizar', () => {
  it('troca por cartas que o jogo já tem: a lista nova vale na hora, com a ordem das que ficam', async () => {
    const { rede, catalogo, t, mudancas } = montar();
    rede.deck(TERRA.id, respostaMox(TERRA.id, 'Terra', { nome: TERRA.comandante }, terraTrocada([{ nome: 'Fellwar Stone' }, { nome: 'Bag of Holding' }])));
    const prop = await t.verificar(`https://moxfield.com/decks/${TERRA.id}`);
    expect(prop).toMatchObject({ novo: false, destino: 'jogavel' });
    expect(prop.entram.map((c) => c.nome)).toEqual(['Bag of Holding', 'Fellwar Stone']);
    expect(prop.saem.map((c) => c.nome)).toEqual(['Arcane Signet', 'Thrill of Possibility']);
    await t.confirmar(prop.token);
    expect(mudancas).toEqual([true]);
    const lista = catalogo.listasJogaveis().find((d) => d.id === TERRA.id)!;
    const ficam = TERRA.cartas.filter((c) => c.nome !== 'Arcane Signet' && c.nome !== 'Thrill of Possibility');
    expect(lista.cartas.slice(0, ficam.length)).toEqual(ficam);
    expect(lista.cartas.slice(ficam.length).map((c) => c.nome)).toEqual(['Fellwar Stone', 'Bag of Holding']);
  });

  it('com carta nova: fica guardada e o deck segue jogável com a lista anterior; a mesma busca de novo não muda nada', async () => {
    const { rede, catalogo, t } = montar();
    const nova = cartaFalsa('Pedra de Teste');
    rede.carta(nova);
    rede.deck(ABZAN.id, respostaMox(ABZAN.id, 'Abzan Armor', { nome: ABZAN.comandante }, [...entradas(ABZAN).slice(0, -1), { nome: 'Pedra de Teste', scryfallId: nova.id }]));
    const prop = await t.verificar(ABZAN.id);
    expect(prop.destino).toBe('preparacao');
    expect(prop.resumo).toMatch(/segue com a lista atual/);
    await t.confirmar(prop.token);
    const d = catalogo.ler(ABZAN.id)!;
    expect(d.atual?.cartas).toEqual(ABZAN.cartas);
    expect(d.preparacao?.cartas.at(-1)?.nome).toBe('Pedra de Teste');
    expect(catalogo.listasJogaveis().find((x) => x.id === ABZAN.id)?.cartas).toEqual(ABZAN.cartas);
    expect(catalogo.publico({ carta: () => null }).find((x) => x.id === ABZAN.id)?.estado).toBe('atualizacao');
    const de_novo = await t.verificar(ABZAN.id);
    expect(de_novo.destino).toBe('nada');
    expect(de_novo.resumo).toMatch(/já está guardada/);
    // o dono voltou a lista no Moxfield: confirmar descarta a atualização guardada
    rede.deck(ABZAN.id, respostaMox(ABZAN.id, 'Abzan Armor', { nome: ABZAN.comandante }, entradas(ABZAN)));
    const volta = await t.verificar(ABZAN.id);
    expect(volta.destino).toBe('jogavel');
    await t.confirmar(volta.token);
    expect(catalogo.ler(ABZAN.id)?.preparacao).toBeNull();
  });

  it('nada mudou no Moxfield', async () => {
    const { rede, t } = montar();
    rede.deck(TERRA.id, respostaMox(TERRA.id, 'Terra', { nome: TERRA.comandante }, entradas(TERRA)));
    const prop = await t.verificar(TERRA.id);
    expect(prop).toMatchObject({ destino: 'nada', entram: [], saem: [] });
    expect(prop.resumo).toMatch(/Nenhuma carta mudou/);
  });
});

describe('segurança da gravação', () => {
  it('uma falha no meio (imagem) não muda o arquivo do deck nem gerado/', async () => {
    const { p, rede, t } = montar();
    const nova = cartaFalsa('Quebrada de Teste');
    rede.carta(nova);
    rede.falhar.add(nova.image_uris!.png);
    rede.deck(TERRA.id, respostaMox(TERRA.id, 'Terra', { nome: TERRA.comandante }, terraTrocada([{ nome: 'Fellwar Stone' }, { nome: 'Quebrada de Teste', scryfallId: nova.id }])));
    const antes = readFileSync(join(p.decks, `${TERRA.id}.json`), 'utf8');
    const geradoAntes = readFileSync(join(p.gerado, 'cartas.json'), 'utf8');
    const prop = await t.verificar(TERRA.id);
    await expect(t.confirmar(prop.token)).rejects.toThrow();
    expect(readFileSync(join(p.decks, `${TERRA.id}.json`), 'utf8')).toBe(antes);
    expect(readFileSync(join(p.gerado, 'cartas.json'), 'utf8')).toBe(geradoAntes);
    expect(existsSync(join(p.decks, '.trava'))).toBe(false);
  });

  it('a trava impede gravar junto com a linha de comando; trava de processo morto não impede', async () => {
    const { p } = montar();
    let dentro = false;
    await comTrava(p.decks, async () => {
      dentro = true;
      await expect(comTrava(p.decks, async () => 1)).rejects.toBeInstanceOf(ErroTrava);
    });
    expect(dentro).toBe(true);
    writeFileSync(join(p.decks, '.trava'), JSON.stringify({ pid: 999999, desde: 'x' }));
    expect(await comTrava(p.decks, async () => 2)).toBe(2);
  });

  it('erro na busca aparece na tarefa', async () => {
    const { t } = montar();
    const id = t.iniciarVerificar('https://moxfield.com/decks/NaoExisteNada1234');
    await ate(() => terminaram(t));
    expect(t.tarefa(id)).toMatchObject({ estado: 'erro', erro: expect.stringMatching(/não encontrado no Moxfield/) });
  });
});

describe('várias importações ao mesmo tempo', () => {
  it('decks diferentes andam juntos; o mesmo deck duas vezes ao mesmo tempo é recusado', async () => {
    const { rede, t } = montar();
    rede.deck(TERRA.id, respostaMox(TERRA.id, 'Terra', { nome: TERRA.comandante }, entradas(TERRA)));
    rede.deck(ABZAN.id, respostaMox(ABZAN.id, 'Abzan Armor', { nome: ABZAN.comandante }, entradas(ABZAN)));
    const a = t.iniciarVerificar(TERRA.id);
    const b = t.iniciarVerificar(`https://moxfield.com/decks/${ABZAN.id}`);
    expect(a).not.toBe(b);
    expect(t.lista().map((x) => [x.id, x.estado])).toEqual([[a, 'andando'], [b, 'andando']]);
    expect(() => t.iniciarVerificar(`https://moxfield.com/decks/${TERRA.id}`)).toThrow(ErroOcupado);
    await expect(t.verificar(TERRA.id)).rejects.toBeInstanceOf(ErroOcupado);
    await ate(() => terminaram(t));
    expect(t.tarefa(a)).toMatchObject({ estado: 'pronta', deck: TERRA.id, proposta: { destino: 'nada' } });
    expect(t.tarefa(b)).toMatchObject({ estado: 'pronta', deck: ABZAN.id, proposta: { destino: 'nada' } });
    // terminou: o mesmo deck pode ser buscado de novo, e as que terminaram continuam na lista
    const c = t.iniciarVerificar(TERRA.id);
    await ate(() => terminaram(t));
    expect(t.lista().map((x) => x.id)).toEqual([a, b, c]);
  });

  it('dois decks novos importados juntos: os dois gravados, com a carta e a ficha em comum uma vez só', async () => {
    const { p, rede, catalogo, t, mudancas } = montar();
    const fichasAntes = lerNovas(p.decks).fichas;
    const ordem = catalogo.proximaOrdem();
    const soldado = cartaFalsa('Soldado Comum de Teste', { layout: 'token', type_line: 'Token Creature — Soldier', image_uris: { png: 'https://cards.scryfall.io/png/front/s/c/soldado-comum.png' } });
    const criaSoldado = { type_line: 'Creature — Human', oracle_text: 'When this enters, create a 1/1 Soldier token.', all_parts: [{ id: soldado.id, component: 'token', name: soldado.name }] };
    const a = cartaFalsa('Recrutador A de Teste', criaSoldado);
    const b = cartaFalsa('Recrutador B de Teste', criaSoldado);
    const comum = cartaFalsa('Artefato Comum de Teste');
    rede.carta(soldado, a, b, comum);
    rede.deck('DeckJuntoA123456', respostaMox('DeckJuntoA123456', 'Junto A', { nome: TERRA.comandante }, terraTrocada([{ nome: a.name, scryfallId: a.id }, { nome: comum.name, scryfallId: comum.id }])));
    rede.deck('DeckJuntoB123456', respostaMox('DeckJuntoB123456', 'Junto B', { nome: TERRA.comandante }, terraTrocada([{ nome: b.name, scryfallId: b.id }, { nome: comum.name, scryfallId: comum.id }])));
    const ia = t.iniciarImportar('https://moxfield.com/decks/DeckJuntoA123456');
    const ib = t.iniciarImportar('https://moxfield.com/decks/DeckJuntoB123456');
    await ate(() => terminaram(t));
    for (const [id, deck] of [[ia, 'DeckJuntoA123456'], [ib, 'DeckJuntoB123456']] as const) {
      expect(t.tarefa(id)).toMatchObject({ estado: 'pronta', tipo: 'confirmar', deck, proposta: { novo: true, destino: 'preparacao' }, resultado: { id: deck, destino: 'preparacao' } });
    }
    expect(mudancas).toEqual([false, false]);
    const da = catalogo.ler('DeckJuntoA123456')!;
    const db = catalogo.ler('DeckJuntoB123456')!;
    expect(da.preparacao?.cartas.map((c) => c.nome)).toContain(a.name);
    expect(db.preparacao?.cartas.map((c) => c.nome)).toContain(b.name);
    expect([da.ordem, db.ordem].sort()).toEqual([ordem, ordem + 1]);
    // nada se perdeu: as cartas das duas, a comum e a ficha uma vez
    const novas = lerNovas(p.decks);
    for (const c of [a, b, comum]) expect(novas.escolhas[c.name], c.name).toEqual({ en: c.id, pt: null });
    expect(novas.fichas).toEqual([...fichasAntes, soldado.oracle_id]);
    const g = lerAnterior(p.gerado);
    for (const c of [a, b, comum]) expect(g.cartas?.cartas[c.name], c.name).toBeDefined();
    expect(g.cartas?.fichas.filter((f) => f.name === soldado.name)).toHaveLength(1);
    expect(existsSync(join(p.decks, '.trava'))).toBe(false);
  });

  it('a mesma carta nova com impressões diferentes em dois decks juntos: uma escolha só e nenhuma impressão solta', async () => {
    const { p, rede, catalogo, t } = montar();
    const a = cartaFalsa('Carta Dupla de Teste');
    const b = cartaFalsa('Carta Dupla de Teste', { oracle: a.oracle_id!, set: 'out' });
    rede.carta(a, b);
    rede.deck('DuplaPrimeira123', respostaMox('DuplaPrimeira123', 'Dupla 1', { nome: TERRA.comandante }, terraTrocada([{ nome: a.name, scryfallId: a.id }, { nome: 'Fellwar Stone' }])));
    rede.deck('DuplaSegunda1234', respostaMox('DuplaSegunda1234', 'Dupla 2', { nome: TERRA.comandante }, terraTrocada([{ nome: b.name, scryfallId: b.id }, { nome: 'Fellwar Stone' }])));
    t.iniciarImportar('DuplaPrimeira123');
    t.iniciarImportar('DuplaSegunda1234');
    await ate(() => terminaram(t));
    expect(t.lista().map((x) => x.estado)).toEqual(['pronta', 'pronta']);
    for (const id of ['DuplaPrimeira123', 'DuplaSegunda1234']) expect(catalogo.ler(id)?.preparacao?.cartas.map((c) => c.nome)).toContain(a.name);
    const novas = lerNovas(p.decks);
    const carta = novas.cards[a.oracle_id!];
    expect([a.id, b.id]).toContain(novas.escolhas[a.name].en);
    // toda impressão guardada desta carta é uma das da carta (a de quem gravou depois não ficou solta)
    const impressoes = Object.values(novas.printings).filter((x) => x.oracle_id === a.oracle_id);
    expect(impressoes.map((x) => x.id)).toEqual([novas.escolhas[a.name].en]);
    expect(carta.printing_ids).toEqual([novas.escolhas[a.name].en]);
  });

  it('a etapa que cai no limite de 250 ms chega à tela depois (a última sempre aparece)', async () => {
    const p = pastasTemp();
    const vistos: string[] = [];
    const rede = new RedeFalsa();
    const catalogo = new Catalogo({ pasta: p.decks, pronta: cartaPronta });
    const t = new TarefasDecks({ pastas: p, rede, catalogo, pronta: cartaPronta, artes: false, aoAndamento: (x) => vistos.push(x.etapa) });
    const nova = cartaFalsa('Etapas de Teste');
    rede.carta(nova);
    rede.deck('EtapasTeste12345', respostaMox('EtapasTeste12345', 'Etapas', { nome: TERRA.comandante }, terraTrocada([{ nome: nova.name, scryfallId: nova.id }, { nome: 'Fellwar Stone' }])));
    // a gravação espera a trava (a "linha de comando") por um tempo: a tela precisa saber
    writeFileSync(join(p.decks, '.trava'), JSON.stringify({ pid: process.pid, desde: 'x' }));
    const id = t.iniciarImportar('EtapasTeste12345');
    await ate(() => vistos.includes('Esperando a vez de gravar'));
    rmSync(join(p.decks, '.trava'));
    await ate(() => terminaram(t));
    expect(vistos).toContain('Gravando');
    expect(vistos.at(-1)).toBe('Pronto');
    expect(t.tarefa(id)?.estado).toBe('pronta');
  });

  it('importar direto: deck novo vai até o fim; link de deck da mesa e lista ilegal param na prévia', async () => {
    const { rede, catalogo, t } = montar();
    rede.deck('NovoDireto123456', respostaMox('NovoDireto123456', 'Direto', { nome: TERRA.comandante }, entradas(TERRA)));
    rede.deck(TERRA.id, respostaMox(TERRA.id, 'Terra', { nome: TERRA.comandante }, terraTrocada([{ nome: 'Fellwar Stone' }, { nome: 'Bag of Holding' }])));
    rede.deck('DiretoIlegal1234', respostaMox('DiretoIlegal1234', 'Ilegal', { nome: TERRA.comandante }, entradas(TERRA).slice(1)));
    const novo = t.iniciarImportar('NovoDireto123456');
    const existente = t.iniciarImportar(TERRA.id);
    const ilegal = t.iniciarImportar('DiretoIlegal1234');
    await ate(() => terminaram(t));
    expect(t.tarefa(novo)).toMatchObject({ estado: 'pronta', tipo: 'confirmar', resultado: { destino: 'jogavel', texto: 'Direto entrou no saguão.' } });
    expect(catalogo.listasJogaveis().map((d) => d.id)).toContain('NovoDireto123456');
    // a atualização espera a pessoa ver o que entra e o que sai
    const tx = t.tarefa(existente)!;
    expect(tx).toMatchObject({ estado: 'pronta', tipo: 'verificar', proposta: { novo: false, destino: 'jogavel' } });
    expect(tx.resultado).toBeUndefined();
    expect(catalogo.listasJogaveis().find((d) => d.id === TERRA.id)?.cartas).toEqual(TERRA.cartas);
    const ti = t.tarefa(ilegal)!;
    expect(ti.proposta?.erros.join(' ')).toMatch(/99 cartas/);
    expect(ti.resultado).toBeUndefined();
    expect(catalogo.ler('DiretoIlegal1234')).toBeNull();
  });

  it('com a linha de comando gravando, a importação espera a vez; se demorar demais, desiste com aviso', async () => {
    const { p, rede, catalogo, t } = montar(pastasTemp(), 3000);
    rede.deck('EsperaTrava12345', respostaMox('EsperaTrava12345', 'Espera', { nome: TERRA.comandante }, entradas(TERRA)));
    // a trava com o pid de um processo vivo (este) faz o papel da linha de comando
    writeFileSync(join(p.decks, '.trava'), JSON.stringify({ pid: process.pid, desde: 'x' }));
    const id = t.iniciarImportar('EsperaTrava12345');
    await ate(() => t.tarefa(id)?.etapa === 'Esperando a vez de gravar');
    await new Promise((ok) => setTimeout(ok, 600));
    expect(t.tarefa(id)?.estado).toBe('andando');
    expect(catalogo.ler('EsperaTrava12345')).toBeNull();
    rmSync(join(p.decks, '.trava'));
    await ate(() => terminaram(t));
    expect(t.tarefa(id)).toMatchObject({ estado: 'pronta', resultado: { destino: 'jogavel' } });
    expect(catalogo.ler('EsperaTrava12345')).not.toBeNull();

    const curto = montar(pastasTemp(), 100);
    curto.rede.deck('EsperaTrava12345', respostaMox('EsperaTrava12345', 'Espera', { nome: TERRA.comandante }, entradas(TERRA)));
    writeFileSync(join(curto.p.decks, '.trava'), JSON.stringify({ pid: process.pid, desde: 'x' }));
    const id2 = curto.t.iniciarImportar('EsperaTrava12345');
    await ate(() => terminaram(curto.t));
    expect(curto.t.tarefa(id2)).toMatchObject({ estado: 'erro', erro: expect.stringMatching(/Outra importação está gravando/) });
    expect(curto.catalogo.ler('EsperaTrava12345')).toBeNull();
  });

  it('rotas: importar começa direto, o GET traz todas as tarefas e o mesmo deck de novo dá 409', async () => {
    const { rede, catalogo, t } = montar();
    rede.deck('RotaDireta123456', respostaMox('RotaDireta123456', 'Pela rota', { nome: TERRA.comandante }, entradas(TERRA)));
    rede.deck(ABZAN.id, respostaMox(ABZAN.id, 'Abzan Armor', { nome: ABZAN.comandante }, entradas(ABZAN)));
    const rotas = new RotasCatalogo({ catalogo, tarefas: t, info: { carta: () => null } });
    const pedir = (caminho: string, corpo: unknown) => rotas.tratar('POST', caminho, JSON.stringify(corpo), '127.0.0.1')!;
    const r1 = pedir('/api/catalogo/importar', { link: 'https://moxfield.com/decks/RotaDireta123456' });
    expect(r1.status).toBe(202);
    const r2 = pedir(`/api/catalogo/${ABZAN.id}/verificar`, {});
    expect(r2.status).toBe(202);
    expect(pedir('/api/catalogo/importar', { link: 'https://moxfield.com/decks/RotaDireta123456' })).toEqual({ status: 409, corpo: { erro: 'Esse deck já está sendo buscado ou importado; espere terminar' } });
    await ate(() => terminaram(t));
    const lista = rotas.tratar('GET', '/api/catalogo', '', '127.0.0.1')!.corpo as { tarefas: { id: number; estado: string; resultado?: unknown }[] };
    const ids = [(r1.corpo as { tarefa: number }).tarefa, (r2.corpo as { tarefa: number }).tarefa];
    expect(lista.tarefas.map((x) => x.id)).toEqual(ids);
    expect(lista.tarefas[0]).toMatchObject({ estado: 'pronta', resultado: { destino: 'jogavel' } });
    expect(lista.tarefas[1]).toMatchObject({ estado: 'pronta', proposta: { destino: 'nada' } });
  });
});
