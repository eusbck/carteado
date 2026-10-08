// Importar e atualizar pelo Moxfield, de ponta a ponta, com a rede falsa e pastas temporárias:
// deck só com cartas conhecidas entra no saguão; carta nova deixa em preparação (dados, imagens, rulings e fichas
// gravados); atualização pronta troca a lista; a que espera cartas fica guardada com a lista antiga jogável.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import '../../cartas/index.ts';
import type { DeckList } from '../../motor/state.ts';
import { Catalogo } from '../../servidor/catalogo/catalogo.ts';
import { lerNovas, lerAnterior } from '../../servidor/catalogo/gerar.ts';
import { cartaPronta } from '../../servidor/catalogo/prontidao.ts';
import { TarefasDecks, ErroOcupado } from '../../servidor/catalogo/tarefas.ts';
import { comTrava, ErroTrava } from '../../servidor/catalogo/trava.ts';
import type { Pastas } from '../../servidor/catalogo/caminhos.ts';
import decksTeste from '../decks-teste.json' with { type: 'json' };
import { cartaFalsa, pastasTemp, RedeFalsa, respostaMox, type EntradaFalsa } from './ajuda.ts';

const DECKS = decksTeste as DeckList[];
const TERRA = DECKS.find((d) => d.nome === 'Terra')!;
const ABZAN = DECKS.find((d) => d.nome === 'Abzan Armor')!;
const entradas = (d: DeckList): EntradaFalsa[] => d.cartas.map((c) => ({ nome: c.nome, quantidade: c.quantidade }));

function montar(p: Pastas = pastasTemp()) {
  const rede = new RedeFalsa();
  const catalogo = new Catalogo({ pasta: p.decks, pronta: cartaPronta });
  const mudancas: boolean[] = [];
  const t = new TarefasDecks({ pastas: p, rede, catalogo, pronta: cartaPronta, artes: false, aoMudar: (x) => mudancas.push(x) });
  return { p, rede, catalogo, t, mudancas };
}

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

  it('uma tarefa por vez; a trava impede gravar junto com a linha de comando', async () => {
    const { p, rede, t } = montar();
    rede.deck(TERRA.id, respostaMox(TERRA.id, 'Terra', { nome: TERRA.comandante }, entradas(TERRA)));
    const id = t.iniciarVerificar(TERRA.id);
    expect(t.tarefa).toMatchObject({ id, estado: 'andando' });
    expect(() => t.iniciarVerificar(TERRA.id)).toThrow(ErroOcupado);
    await expect(t.verificar(TERRA.id)).rejects.toBeInstanceOf(ErroOcupado);
    await new Promise((ok) => setTimeout(ok, 50));
    expect(t.tarefa).toMatchObject({ id, estado: 'pronta', proposta: { destino: 'nada' } });
    let dentro = false;
    await comTrava(p.decks, async () => {
      dentro = true;
      await expect(comTrava(p.decks, async () => 1)).rejects.toBeInstanceOf(ErroTrava);
    });
    expect(dentro).toBe(true);
    // trava esquecida por um processo que já morreu não impede
    writeFileSync(join(p.decks, '.trava'), JSON.stringify({ pid: 999999, desde: 'x' }));
    expect(await comTrava(p.decks, async () => 2)).toBe(2);
  });

  it('erro na busca aparece na tarefa', async () => {
    const { t } = montar();
    t.iniciarVerificar('https://moxfield.com/decks/NaoExisteNada1234');
    await new Promise((ok) => setTimeout(ok, 50));
    expect(t.tarefa).toMatchObject({ estado: 'erro', erro: expect.stringMatching(/não encontrado no Moxfield/) });
  });
});
