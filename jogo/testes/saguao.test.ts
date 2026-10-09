// Saguão em passos e prévia dos decks, no servidor, sem rede (conexões falsas, banco em memória e pastas
// temporárias):
//  - etapa do saguão (lugares → regras → decks): começa nos lugares, só o anfitrião muda, não avança com lugar
//    livre, volta para os lugares quando um lugar vaga (humano que sai ou bot tirado) sem perder os decks
//    escolhidos, não muda com a partida em andamento, fica salva com a sala; e `iniciar` não depende dela (a etapa
//    só guia a interface);
//  - lista de um deck para a prévia no saguão: `Catalogo.lista` (lista atual, comandante à parte, dados de cada
//    carta) e a rota GET /api/catalogo/<id>/cartas (as outras rotas do catálogo continuam como antes).
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import type { DeckList } from '../motor/state.ts';
import { Banco } from '../servidor/banco.ts';
import { Catalogo, type InfoDisco } from '../servidor/catalogo/catalogo.ts';
import { RotasCatalogo } from '../servidor/catalogo/rotas.ts';
import type { TarefasDecks } from '../servidor/catalogo/tarefas.ts';
import type { DeckArquivo, Lista, VersaoLista } from '../servidor/catalogo/tipos.ts';
import type { EtapaSaguao, ListaDeck, MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';
import { pastasTemp } from './catalogo/ajuda.ts';

const DECKS = decksJson as DeckList[];

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  msgs: MsgServidor[] = [];
  enviar(m: MsgServidor) { this.msgs.push(m); }
  ultima<T extends MsgServidor['t']>(t: T): Extract<MsgServidor, { t: T }> | undefined {
    return [...this.msgs].reverse().find((m) => m.t === t) as Extract<MsgServidor, { t: T }> | undefined;
  }
  /** mensagens de erro recebidas */
  erros(): string[] {
    return this.msgs.flatMap((m) => (m.t === 'erro' ? [m.msg] : []));
  }
}

// as mensagens do saguão mandam a sala no fim da condução (avancar): espera a vez dela antes de ler
const espera = () => new Promise((r) => setTimeout(r, 0));

/** sala de 4 de Ana (anfitriã, assento 0) com Bruno no assento 1; os assentos 2 e 3 ficam livres */
function salaDeDois(modo: '4p' | '1v1' = '4p', banco = new Banco(':memory:')) {
  const g = new Gerente(banco, DECKS, SEM_ATRASO);
  const ana = new Falsa();
  g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo });
  const codigo = ana.ultima('sala')!.sala.codigo;
  const bruno = new Falsa();
  g.tratar(bruno, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Bruno' });
  return { g, banco, ana, bruno, codigo };
}

/** a anfitriã enche os assentos livres de uma sala de 4 com bots (cada um com um deck) */
function encherComBots(g: Gerente, anfitria: Falsa) {
  g.tratar(anfitria, { t: 'bot', assento: 2, deck: DECKS[2].id });
  g.tratar(anfitria, { t: 'bot', assento: 3, deck: DECKS[3].id });
}

/** a etapa como a pessoa vê (última sala recebida) */
const etapaVista = (p: Falsa) => p.ultima('sala')!.sala.etapa;

describe('saguão: etapa (lugares, regras, decks)', () => {
  it('a sala nova começa nos lugares, e quem entra recebe a etapa junto com a sala', async () => {
    const { g, ana, bruno, codigo } = salaDeDois();
    await espera();
    expect(etapaVista(ana)).toBe('lugares');
    expect(etapaVista(bruno)).toBe('lugares');
    expect(g.salas.get(codigo)!.publica().etapa).toBe('lugares');
  });

  it('só o anfitrião muda a etapa: o convidado recebe o erro e nada muda', async () => {
    const { g, ana, bruno, codigo } = salaDeDois();
    encherComBots(g, ana);
    g.tratar(bruno, { t: 'etapa', etapa: 'regras' });
    expect(bruno.ultima('erro')?.msg).toMatch(/Só quem criou a sala avança o saguão/);
    // até voltar para os lugares é só com o anfitrião
    g.tratar(bruno, { t: 'etapa', etapa: 'lugares' });
    expect(bruno.erros()).toHaveLength(2);
    await espera();
    expect(g.salas.get(codigo)!.publica().etapa).toBe('lugares');
    expect(etapaVista(ana)).toBe('lugares');
    expect(ana.erros()).toEqual([]);
  });

  it('com lugar livre o anfitrião não avança (nem para as regras nem para os decks); voltar aos lugares sempre vale', async () => {
    const { g, ana, codigo } = salaDeDois();
    g.tratar(ana, { t: 'etapa', etapa: 'regras' });
    expect(ana.ultima('erro')?.msg).toMatch(/Ainda há lugares livres/);
    g.tratar(ana, { t: 'etapa', etapa: 'decks' });
    expect(ana.erros()).toHaveLength(2);
    expect(ana.ultima('erro')?.msg).toMatch(/Ainda há lugares livres/);
    // um bot só: ainda falta um lugar
    g.tratar(ana, { t: 'bot', assento: 2, deck: DECKS[2].id });
    g.tratar(ana, { t: 'etapa', etapa: 'regras' });
    expect(ana.erros()).toHaveLength(3);
    g.tratar(ana, { t: 'etapa', etapa: 'lugares' });
    expect(ana.erros()).toHaveLength(3);
    await espera();
    expect(g.salas.get(codigo)!.publica().etapa).toBe('lugares');
  });

  it('com os lugares cheios (bots), avança para as regras e para os decks, volta, e todos recebem a etapa', async () => {
    const { g, ana, bruno, codigo } = salaDeDois();
    encherComBots(g, ana);
    g.tratar(ana, { t: 'etapa', etapa: 'regras' });
    await espera();
    expect(etapaVista(ana)).toBe('regras');
    expect(etapaVista(bruno)).toBe('regras');
    g.tratar(ana, { t: 'etapa', etapa: 'decks' });
    await espera();
    expect(etapaVista(bruno)).toBe('decks');
    expect(g.salas.get(codigo)!.d.etapa).toBe('decks');
    // e volta um passo, e volta aos lugares
    g.tratar(ana, { t: 'etapa', etapa: 'regras' });
    await espera();
    expect(etapaVista(bruno)).toBe('regras');
    g.tratar(ana, { t: 'etapa', etapa: 'lugares' });
    await espera();
    expect(etapaVista(bruno)).toBe('lugares');
    expect(ana.erros()).toEqual([]);
  });

  it('passo desconhecido é recusado e a etapa fica onde estava', async () => {
    const { g, ana, codigo } = salaDeDois();
    encherComBots(g, ana);
    g.tratar(ana, { t: 'etapa', etapa: 'regras' });
    for (const errado of ['jogo', 'REGRAS', '', 3, null, undefined]) g.tratar(ana, { t: 'etapa', etapa: errado as unknown as EtapaSaguao });
    expect(ana.erros()).toHaveLength(6);
    expect(ana.erros().every((m) => /Passo desconhecido/.test(m))).toBe(true);
    await espera();
    expect(g.salas.get(codigo)!.publica().etapa).toBe('regras');
    expect(etapaVista(ana)).toBe('regras');
  });

  it('escolher deck, trocar o deck ou o nível de um bot não mexe na etapa', async () => {
    const { g, ana, bruno, codigo } = salaDeDois();
    encherComBots(g, ana);
    g.tratar(ana, { t: 'etapa', etapa: 'decks' });
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(bruno, { t: 'deck', deck: DECKS[1].id });
    g.tratar(ana, { t: 'bot', assento: 2, deck: DECKS[4].id });
    g.tratar(ana, { t: 'bot', assento: 3, deck: DECKS[3].id, nivel: 'iniciante' });
    await espera();
    expect([...ana.erros(), ...bruno.erros()]).toEqual([]);
    expect(g.salas.get(codigo)!.publica().etapa).toBe('decks');
    expect(etapaVista(bruno)).toBe('decks');
  });

  it('humano que sai com a sala esperando: o saguão volta para os lugares e os decks dos outros continuam', async () => {
    const { g, ana, bruno, codigo } = salaDeDois();
    encherComBots(g, ana);
    g.tratar(ana, { t: 'etapa', etapa: 'regras' });
    g.tratar(ana, { t: 'etapa', etapa: 'decks' });
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(bruno, { t: 'deck', deck: DECKS[1].id });
    g.tratar(bruno, { t: 'sair' });
    expect(bruno.ultima('saiu')).toBeDefined();
    await espera();
    const sala = ana.ultima('sala')!.sala;
    expect(sala.etapa).toBe('lugares');
    expect(g.salas.get(codigo)!.d.etapa).toBe('lugares');
    // o lugar de Bruno vagou (sem o deck dele); o da anfitriã e os dos bots ficam como estavam
    expect(sala.assentos[1]).toMatchObject({ tipo: 'vazio', nome: null, deck: null });
    expect(sala.assentos[0]).toMatchObject({ tipo: 'humano', nome: 'Ana', deck: DECKS[0].id });
    expect(sala.assentos.slice(2).map((a) => [a.tipo, a.deck])).toEqual([['bot', DECKS[2].id], ['bot', DECKS[3].id]]);
    // com o lugar livre, não dá para avançar de novo
    g.tratar(ana, { t: 'etapa', etapa: 'regras' });
    expect(ana.ultima('erro')?.msg).toMatch(/Ainda há lugares livres/);
  });

  it('quando a anfitriã sai, o saguão volta para os lugares e quem ficou passa a conduzir', async () => {
    const { g, ana, bruno } = salaDeDois();
    encherComBots(g, ana);
    g.tratar(ana, { t: 'etapa', etapa: 'regras' });
    g.tratar(bruno, { t: 'deck', deck: DECKS[1].id });
    g.tratar(ana, { t: 'sair' });
    await espera();
    const sala = bruno.ultima('sala')!.sala;
    expect(sala.etapa).toBe('lugares');
    expect(sala.anfitriao).toBe(1);
    expect(sala.assentos[1].deck).toBe(DECKS[1].id);
    // Bruno agora conduz: põe um bot no lugar que vagou e avança
    g.tratar(bruno, { t: 'bot', assento: 0, deck: DECKS[0].id });
    g.tratar(bruno, { t: 'etapa', etapa: 'regras' });
    await espera();
    expect(bruno.erros()).toEqual([]);
    expect(etapaVista(bruno)).toBe('regras');
  });

  it('todas as pessoas saem: quem entra depois passa a conduzir a sala (põe bot, avança e começa)', async () => {
    const { g, ana, bruno, codigo } = salaDeDois('1v1');
    g.tratar(ana, { t: 'sair' });
    g.tratar(bruno, { t: 'sair' });
    await espera();
    const carla = new Falsa();
    g.tratar(carla, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Carla' });
    await espera();
    const s = carla.ultima('sala')!;
    expect(s.sala.anfitriao).toBe(s.voce);
    g.tratar(carla, { t: 'bot', assento: s.voce === 0 ? 1 : 0, deck: DECKS[1].id });
    g.tratar(carla, { t: 'etapa', etapa: 'regras' });
    await espera();
    expect(carla.erros()).toEqual([]);
    expect(etapaVista(carla)).toBe('regras');
  });

  it('tirar um bot vaga o lugar: o saguão volta para os lugares, e os outros bots e decks ficam', async () => {
    const { g, ana, bruno, codigo } = salaDeDois();
    encherComBots(g, ana);
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(bruno, { t: 'deck', deck: DECKS[1].id });
    g.tratar(ana, { t: 'etapa', etapa: 'decks' });
    g.tratar(ana, { t: 'bot', assento: 3, deck: null });
    await espera();
    expect(ana.erros()).toEqual([]);
    expect(g.salas.get(codigo)!.d.etapa).toBe('lugares');
    const sala = bruno.ultima('sala')!.sala;
    expect(sala.etapa).toBe('lugares');
    expect(sala.assentos.map((a) => [a.tipo, a.deck])).toEqual([['humano', DECKS[0].id], ['humano', DECKS[1].id], ['bot', DECKS[2].id], ['vazio', null]]);
  });

  it('iniciar não depende da etapa: com todos sentados e com deck, a partida começa direto dos lugares', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id });
    expect(g.salas.get(codigo)!.publica().etapa).toBe('lugares');
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    expect(ana.erros()).toEqual([]);
    expect(g.salas.get(codigo)!.d.estado).toBe('jogando');
    expect(ana.ultima('sala')!.sala.estado).toBe('jogando');
    expect(ana.ultima('jogo')?.vista.you).toBe(0);
  }, 60000);

  it('com a partida em andamento a etapa não muda, e quem sai no meio da partida não a reinicia', async () => {
    const { g, ana, bruno, codigo } = salaDeDois();
    encherComBots(g, ana);
    g.tratar(ana, { t: 'etapa', etapa: 'regras' });
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(bruno, { t: 'deck', deck: DECKS[1].id });
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    expect(g.salas.get(codigo)!.d.estado).toBe('jogando');
    for (const etapa of ['lugares', 'decks'] as const) g.tratar(ana, { t: 'etapa', etapa });
    expect(ana.erros()).toHaveLength(2);
    expect(ana.erros().every((m) => /A partida já começou/.test(m))).toBe(true);
    expect(g.salas.get(codigo)!.publica().etapa).toBe('regras');
    // sair no meio da partida é conceder: a partida segue entre os outros três, o assento continua de Bruno e a
    // etapa fica (num 1v1 a concessão encerra a partida e aí o lugar vaga, como numa sala esperando)
    g.tratar(bruno, { t: 'sair' });
    await espera();
    expect(g.salas.get(codigo)!.d.estado).toBe('jogando');
    const sala = ana.ultima('sala')!.sala;
    expect(sala.etapa).toBe('regras');
    expect(sala.assentos[1]).toMatchObject({ tipo: 'humano', nome: 'Bruno' });
  }, 60000);

  it('a etapa fica salva com a sala e volta depois de reiniciar o servidor; sala salva sem a etapa volta nos lugares', async () => {
    const banco = new Banco(':memory:');
    const { g, ana, codigo } = salaDeDois('4p', banco);
    encherComBots(g, ana);
    g.tratar(ana, { t: 'etapa', etapa: 'decks' });
    const token = ana.ultima('sala')!.token;
    // outra sala, que nunca mudou de etapa: é gravada sem o campo (como as salas de antes)
    const davi = new Falsa();
    g.tratar(davi, { t: 'criar', nome: 'Davi', senhaSala: 'outra', modo: '1v1' });
    const outra = davi.ultima('sala')!.sala.codigo;
    const gravada = banco.salas().find((s) => s.codigo === outra)!.dados as { etapa?: EtapaSaguao };
    expect(gravada.etapa).toBeUndefined();
    // "reinício": novo gerente com o mesmo banco
    const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
    g2.restaurar();
    expect(g2.salas.get(codigo)!.publica().etapa).toBe('decks');
    expect(g2.salas.get(outra)!.publica().etapa).toBe('lugares');
    const volta = new Falsa();
    g2.tratar(volta, { t: 'retomar', codigo, token });
    expect(volta.ultima('sala')?.sala.etapa).toBe('decks');
    // e a anfitriã continua conduzindo depois do reinício
    g2.tratar(volta, { t: 'etapa', etapa: 'lugares' });
    await espera();
    expect(volta.erros()).toEqual([]);
    expect(etapaVista(volta)).toBe('lugares');
  });
});

// ---------------------------------------------------------------------------- prévia dos decks

const l = (comandante: string, ...cartas: [string, number?][]): Lista => ({ comandante, cartas: cartas.map(([nome, quantidade = 1]) => ({ nome, quantidade })) });
const v = (lista: Lista): VersaoLista => ({ ...lista, origem: { versao: null, atualizadoEm: null }, desde: '2026-10-07T00:00:00.000Z' });

/** dados das cartas no disco (falsos): 'Sem Dados' não está em gerado/ */
const INFO: InfoDisco = {
  carta: (nome) => nome === 'Sem Dados' ? null : {
    pt: nome === 'Cmd' ? 'Comandante em pt' : null,
    img: `img-${nome}`,
    tipo: nome === 'Cmd' ? 'Legendary Creature — Human Wizard' : nome === 'Island' ? 'Basic Land — Island' : 'Instant',
    cores: ['U'],
  },
};

/** a rota GET da lista não deve tocar nas tarefas de importação: qualquer uso delas quebra o teste */
const SEM_TAREFAS = new Proxy({}, { get: (_, k) => { throw new Error(`a rota usou tarefas.${String(k)}`); } }) as TarefasDecks;

/**
 * Catálogo numa pasta temporária: um deck jogável (com uma versão nova em preparação), um que só existe em
 * preparação, e um cujo arquivo também traz o comandante entre as cartas.
 */
function catalogo() {
  const p = pastasTemp({ decks: false });
  const prontas = new Set(['Cmd', 'A', 'B', 'Island', 'Sem Dados', 'Outro']);
  const c = new Catalogo({ pasta: p.decks, pronta: (n) => prontas.has(n) });
  const base: Omit<DeckArquivo, 'id' | 'ordem' | 'nome' | 'atual' | 'preparacao'> = { formato: 1, link: 'https://moxfield.com/decks/x', importadoEm: '2026-10-07T00:00:00.000Z', verificadoEm: null };
  c.salvar({ ...base, id: 'Deck123456', ordem: 0, nome: 'Deck Pronto', atual: v(l('Cmd', ['A'], ['Island', 30], ['Sem Dados'], ['B', 2])), preparacao: v(l('Cmd', ['A'], ['Nova'])) });
  c.salvar({ ...base, id: 'Novo123456', ordem: 1, nome: 'Só em preparação', atual: null, preparacao: v(l('Outro', ['Nova'])) });
  c.salvar({ ...base, id: 'Dupl123456', ordem: 2, nome: 'Comandante repetido', atual: v(l('Cmd', ['Cmd'], ['A'])), preparacao: null });
  return { c, p };
}

describe('prévia dos decks: Catalogo.lista', () => {
  it('devolve a lista atual com o comandante à parte, as quantidades e os dados de cada carta', () => {
    const { c } = catalogo();
    const lista = c.lista('Deck123456', INFO);
    expect(lista).toEqual({
      id: 'Deck123456',
      nome: 'Deck Pronto',
      comandante: { nome: 'Cmd', quantidade: 1, pt: 'Comandante em pt', img: 'img-Cmd', tipo: 'Legendary Creature — Human Wizard', pronta: true },
      cartas: [
        { nome: 'A', quantidade: 1, pt: null, img: 'img-A', tipo: 'Instant', pronta: true },
        { nome: 'Island', quantidade: 30, pt: null, img: 'img-Island', tipo: 'Basic Land — Island', pronta: true },
        // carta sem dados em gerado/: sem nome em português, sem imagem e sem tipo
        { nome: 'Sem Dados', quantidade: 1, pt: null, img: null, tipo: '', pronta: true },
        { nome: 'B', quantidade: 2, pt: null, img: 'img-B', tipo: 'Instant', pronta: true },
      ],
    } satisfies ListaDeck);
    // é a lista atual: a carta da versão em preparação não aparece
    expect(lista!.cartas.map((x) => x.nome)).not.toContain('Nova');
  });

  it('o comandante não aparece entre as cartas, mesmo se o arquivo também o listar ali', () => {
    const { c } = catalogo();
    const lista = c.lista('Dupl123456', INFO)!;
    expect(lista.comandante.nome).toBe('Cmd');
    expect(lista.cartas.map((x) => x.nome)).toEqual(['A']);
  });

  it('null para deck desconhecido, id inválido e deck que só existe em preparação', () => {
    const { c } = catalogo();
    expect(c.lista('Nada123456', INFO)).toBeNull();
    expect(c.lista('../cartas', INFO)).toBeNull();
    expect(c.lista('Novo123456', INFO)).toBeNull();
  });
});

describe('prévia dos decks: rota GET /api/catalogo/<id>/cartas', () => {
  it('200 com a lista atual do deck', () => {
    const { c } = catalogo();
    const rotas = new RotasCatalogo({ catalogo: c, tarefas: SEM_TAREFAS, info: INFO });
    const r = rotas.tratar('GET', '/api/catalogo/Deck123456/cartas', '', '127.0.0.1');
    expect(r?.status).toBe(200);
    expect(r?.corpo).toEqual(c.lista('Deck123456', INFO));
    const corpo = r!.corpo as ListaDeck;
    expect(corpo.comandante.nome).toBe('Cmd');
    expect(corpo.cartas).toHaveLength(4);
  });

  it('404 para deck desconhecido e para deck que só existe em preparação', () => {
    const { c } = catalogo();
    const rotas = new RotasCatalogo({ catalogo: c, tarefas: SEM_TAREFAS, info: INFO });
    for (const id of ['Nada123456', 'Novo123456']) {
      expect(rotas.tratar('GET', `/api/catalogo/${id}/cartas`, '', '127.0.0.1')).toEqual({ status: 404, corpo: { erro: 'Deck desconhecido' } });
    }
  });

  it('outros métodos não viram a lista: POST segue o fluxo antigo (rota desconhecida) e os demais continuam com 405', () => {
    const { c } = catalogo();
    const rotas = new RotasCatalogo({ catalogo: c, tarefas: SEM_TAREFAS, info: INFO });
    expect(rotas.tratar('POST', '/api/catalogo/Deck123456/cartas', '', '127.0.0.1')).toEqual({ status: 404, corpo: { erro: 'Rota desconhecida' } });
    for (const metodo of ['PUT', 'DELETE', 'PATCH']) {
      expect(rotas.tratar(metodo, '/api/catalogo/Deck123456/cartas', '', '127.0.0.1')).toEqual({ status: 405, corpo: { erro: 'Método não permitido' } });
    }
    // as rotas de antes continuam exigindo POST
    expect(rotas.tratar('GET', '/api/catalogo/Deck123456/verificar', '', '127.0.0.1')?.status).toBe(405);
    expect(rotas.tratar('GET', '/api/catalogo/importar', '', '127.0.0.1')?.status).toBe(405);
    // e o que não é do catálogo não é com ela
    expect(rotas.tratar('GET', '/api/decks', '', '127.0.0.1')).toBeNull();
  });
});
