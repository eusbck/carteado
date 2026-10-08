// Fase 9, itens 2.1 e 2.2: a lógica pura da janela de escolha (formato de cada decisão, cartas
// iguais juntas, filtro, filas, posição sobre a divisa) e a medida do zoom (centralizado, proporcional
// à tela e sem sair dela). Os módulos são do cliente, mas não usam o navegador.

import { describe, expect, it } from 'vitest';
import type { ChoiceItem, Decision } from '../motor/types.ts';
import {
  agrupar, alternarGrupo, ehEscolha, ehFila, faixaEscolha, filtrar, fonteDoGatilho, formatoEscolha, LIMITE_LINHA, mover,
  ordemDeGatilhos, ordemParaPilha, respostaArranjo, topoJanela, type Aparencia,
} from '../cliente/src/mesa/escolhas.ts';
import { MARGEM_ZOOM, medidaZoom, type MedidaZoom } from '../cliente/src/mesa/medidaZoom.ts';

const sel = (items: ChoiceItem[], min = 1, max = 1, ordered = false): Decision => ({ id: 1, player: 0, prompt: 'Escolha', kind: 'select', items, min, max, ordered });
/** aparência como a janela decide: jogador, carta (com imagem ou objeto) ou texto */
const aparencia = (it: ChoiceItem): Aparencia => (it.player !== undefined ? 'jogador' : it.card || it.obj !== undefined ? 'carta' : 'texto');
const carta = (i: number, def = `Carta ${i}`): ChoiceItem => ({ id: String(i), label: def, obj: 100 + i, card: { def } });
const texto = (id: string, label: string): ChoiceItem => ({ id, label });

describe('Fase 9 (2.1): formato de cada janela de escolha', () => {
  it('sim/não e poucas opções curtas viram botões numa linha; textos longos (modos) viram lista', () => {
    expect(formatoEscolha(sel([texto('yes', 'Sim'), texto('no', 'Não')]), aparencia)).toBe('simnao');
    expect(formatoEscolha(sel(['branco', 'azul', 'preto'].map((c) => texto(c, c))), aparencia)).toBe('simnao');
    const modos = [texto('0', 'Destrua a criatura alvo com poder 3 ou menos.'), texto('1', 'Volte uma carta de criatura do seu cemitério para a sua mão.'), texto('2', 'Você ganha 3 pontos de vida.')];
    expect(formatoEscolha(sel(modos, 1, 2), aparencia)).toBe('opcoes');
    // mais de 3 opções curtas, ou várias para escolher, também viram lista
    expect(formatoEscolha(sel(['W', 'U', 'B', 'R', 'G'].map((c) => texto(c, c))), aparencia)).toBe('opcoes');
    expect(formatoEscolha(sel([texto('yes', 'Sim'), texto('no', 'Não')], 0, 2), aparencia)).toBe('opcoes');
  });

  it('ordenar todos os itens (gatilhos) vira fila; escolher alguns em ordem não', () => {
    const gatilhos = [texto('0', 'Herald of Amity: Sempre que…'), texto('1', 'Coercive Impetus: Sempre que…'), texto('2', 'Killian, Decisive Mentor: Sempre que…')];
    expect(formatoEscolha(sel(gatilhos, 3, 3, true), aparencia)).toBe('fila');
    expect(formatoEscolha(sel([carta(1), carta(2), carta(3)], 1, 1, true), aparencia)).toBe('cartas');
    // a fila dos gatilhos vem do motor (motor/stack.ts) com este texto
    const doMotor: Decision = { ...sel(gatilhos, 3, 3, true), prompt: 'Ordene seus gatilhos: o primeiro vai para a pilha primeiro (resolve por último)' };
    expect(ehFila(doMotor) && ordemDeGatilhos(doMotor)).toBe(true);
    expect(ordemDeGatilhos(sel(gatilhos, 3, 3, true))).toBe(false);
    expect(ehFila(sel([carta(1)], 1, 1, true))).toBe(false);
  });

  it('poucas cartas (e jogadores) ficam grandes lado a lado; muitas vão para a grade', () => {
    const mao = Array.from({ length: LIMITE_LINHA }, (_, i) => carta(i));
    expect(formatoEscolha(sel(mao), aparencia)).toBe('cartas');
    expect(formatoEscolha(sel([carta(1), { id: 'p1', label: 'Bruno', player: 1 }]), aparencia)).toBe('cartas');
    expect(formatoEscolha(sel([{ id: 'p1', label: 'Bruno', player: 1 }, { id: 'p2', label: 'Caio', player: 2 }]), aparencia)).toBe('cartas');
    const grimorio = Array.from({ length: 63 }, (_, i) => carta(i));
    expect(formatoEscolha(sel(grimorio, 0, 1), aparencia)).toBe('grade');
    expect(formatoEscolha(sel([...mao, carta(99)]), aparencia)).toBe('grade');
  });

  it('número e vidência têm formato próprio; prioridade, pagamento e combate ficam na coluna', () => {
    expect(formatoEscolha({ id: 1, player: 0, prompt: 'X', kind: 'number', min: 0, max: 7 }, aparencia)).toBe('numero');
    const arranjo: Decision = { id: 1, player: 0, prompt: 'Vidência 2', kind: 'arrange', items: [carta(1), carta(2)], destinations: ['top', 'bottom'] };
    expect(formatoEscolha(arranjo, aparencia)).toBe('arranjo');
    expect(ehEscolha(arranjo)).toBe(true);
    const prioridade: Decision = { id: 1, player: 0, prompt: '', kind: 'priority', actions: [] };
    expect(ehEscolha(prioridade)).toBe(false);
    expect(formatoEscolha(prioridade, aparencia)).toBeNull();
    expect(ehEscolha({ id: 1, player: 0, prompt: '', kind: 'blockers', candidates: [], attackers: [] })).toBe(false);
  });

  it('a faixa diz quantas escolher', () => {
    expect(faixaEscolha(1, 1)).toBe('Escolha 1');
    expect(faixaEscolha(0, 2)).toBe('Escolha até 2');
    expect(faixaEscolha(1, 3)).toBe('Escolha de 1 a 3');
  });
});

describe('Fase 9 (2.1): busca no grimório', () => {
  it('cartas iguais viram um item só, na ordem em que aparecem', () => {
    const itens = ['Plains', 'Swamp', 'Plains', 'Sol Ring', 'Swamp', 'Plains'];
    const grupos = agrupar(itens.map((n, i) => ({ id: String(i), n })), (x) => (x.n === 'Sol Ring' ? null : x.n));
    expect(grupos.map((g) => [g.itens[0].n, g.itens.length])).toEqual([['Plains', 3], ['Swamp', 2], ['Sol Ring', 1]]);
  });

  it('clicar num grupo escolhe mais uma cópia até o limite; o clique seguinte desmarca o grupo', () => {
    const planicies = ['1', '3', '5'];
    // escolha de um só: marca a primeira cópia, o clique seguinte desmarca; outro grupo troca a escolha
    expect(alternarGrupo([], planicies, 1)).toEqual(['1']);
    expect(alternarGrupo(['1'], planicies, 1)).toEqual([]);
    expect(alternarGrupo(['2'], planicies, 1)).toEqual(['1']);
    // até duas (Cultivate): duas cópias do mesmo grupo, depois desmarca
    expect(alternarGrupo([], planicies, 2)).toEqual(['1']);
    expect(alternarGrupo(['1'], planicies, 2)).toEqual(['1', '3']);
    expect(alternarGrupo(['1', '3'], planicies, 2)).toEqual([]);
    expect(alternarGrupo(['9', '1'], planicies, 2)).toEqual(['9']);
    // item sozinho: o mesmo que antes (marca, desmarca, não passa do limite)
    expect(alternarGrupo(['a'], ['b'], 2)).toEqual(['a', 'b']);
    expect(alternarGrupo(['a', 'b'], ['c'], 2)).toEqual(['a', 'b']);
  });

  it('o filtro ignora maiúsculas e acentos e procura em todos os textos da carta', () => {
    const cartas = [{ n: 'Pântano', en: 'Swamp' }, { n: 'Planície', en: 'Plains' }, { n: 'Anel Solar', en: 'Sol Ring' }];
    const textos = (c: { n: string; en: string }) => [c.n, c.en];
    expect(filtrar(cartas, 'pantano', textos).map((c) => c.en)).toEqual(['Swamp']);
    expect(filtrar(cartas, 'PLAIN', textos).map((c) => c.en)).toEqual(['Plains']);
    expect(filtrar(cartas, ' ', textos)).toHaveLength(3);
  });
});

describe('Fase 9 (2.1): filas, faixas e gatilhos', () => {
  it('mover na fila', () => {
    expect(mover(['a', 'b', 'c', 'd'], 3, 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(mover(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(mover(['a', 'b'], 1, 1)).toEqual(['a', 'b']);
  });

  it('a fila dos gatilhos é a pilha: o de cima resolve primeiro e entra por último', () => {
    // a janela mostra c, b, a (c resolve primeiro); o motor recebe a ordem de entrada na pilha
    expect(ordemParaPilha(['c', 'b', 'a'])).toEqual(['a', 'b', 'c']);
  });

  it('vidência: as faixas viram o destino de cada carta e a ordem (topo primeiro)', () => {
    expect(respostaArranjo(['top', 'bottom'], { top: ['2', '0'], bottom: ['1'] })).toEqual({ placement: { 2: 'top', 0: 'top', 1: 'bottom' }, order: ['2', '0', '1'] });
    expect(respostaArranjo(['top', 'graveyard'], { top: [], graveyard: ['0'] })).toEqual({ placement: { 0: 'graveyard' }, order: ['0'] });
  });

  it('o nome da fonte do gatilho é o prefixo conhecido mais longo (há cartas com ":" no nome)', () => {
    const nomes = new Set(['Herald of Amity', 'Circle of Protection: Red', 'Circle of Protection']);
    const conhecida = (n: string) => nomes.has(n);
    expect(fonteDoGatilho('Herald of Amity: Sempre que esta criatura ataca: ela recebe +1/+0.', conhecida)).toEqual({ fonte: 'Herald of Amity', texto: 'Sempre que esta criatura ataca: ela recebe +1/+0.' });
    expect(fonteDoGatilho('Circle of Protection: Red: Previna o dano.', conhecida)).toEqual({ fonte: 'Circle of Protection: Red', texto: 'Previna o dano.' });
    expect(fonteDoGatilho('regra do jogo: algo', conhecida)).toBeNull();
  });
});

describe('Fase 9 (2.1): posição da janela', () => {
  it('centrada na divisa quando cabe; perto da borda quando não; presa na margem de cima se for alta demais', () => {
    expect(topoJanela(1080, 443, 300, 12)).toBe(293);
    // alta: o centro na divisa passaria da margem de cima
    expect(topoJanela(1080, 443, 1000, 12)).toBe(12);
    // divisa embaixo: encosta na margem de baixo
    expect(topoJanela(800, 700, 400, 12)).toBe(388);
    // mais alta que a mesa: fica na margem de cima e rola por dentro
    expect(topoJanela(800, 368, 900, 12)).toBe(12);
  });
});

describe('Fase 9 (2.2): zoom centralizado e proporcional à tela', () => {
  /** texto de uma carta: área fixa de letras (a altura cai quando a coluna alarga), com a escala da letra */
  const texto = (area: number, linha = 20) => (largura: number, escala: number) => Math.ceil(area * escala * escala / largura / linha) * linha * escala + 6;
  const conferir = (m: MedidaZoom, altura: number, largura: number) => {
    expect(m.topo).toBeGreaterThanOrEqual(MARGEM_ZOOM);
    expect(m.topo + m.altura).toBeLessThanOrEqual(altura - MARGEM_ZOOM);
    // centralizado na altura (arredondamento de 1 px)
    expect(Math.abs(m.topo - (altura - m.altura - m.topo))).toBeLessThanOrEqual(1);
    expect(m.largura).toBeLessThanOrEqual(largura - 2 * MARGEM_ZOOM);
  };

  it('pouco texto: texto embaixo da carta, que tem cerca de 40% da altura da tela', () => {
    for (const [l, a] of [[1672, 1080], [1032, 800], [2300, 1440]]) {
      const m = medidaZoom({ largura: l, altura: a }, texto(3000));
      expect(m.modo).toBe('abaixo');
      expect(m.escala).toBe(1);
      conferir(m, a, l);
    }
    const grande = medidaZoom({ largura: 1672, altura: 1080 }, texto(3000));
    const pequeno = medidaZoom({ largura: 1032, altura: 800 }, texto(3000));
    expect(grande.imagem).toBe(432);
    expect(pequeno.imagem).toBeLessThan(grande.imagem);
  });

  it('muito texto: a carta encolhe um pouco ou o texto vai para o lado, sempre dentro da tela e centralizado', () => {
    const muito = medidaZoom({ largura: 1672, altura: 1080 }, texto(250000));
    expect(muito.modo).toBe('lado');
    expect(muito.escala).toBe(1);
    conferir(muito, 1080, 1672);
    // um pouco mais de texto que o normal: ainda embaixo, com a carta menor
    const medio = medidaZoom({ largura: 1032, altura: 800 }, texto(93500));
    expect(medio.modo).toBe('abaixo');
    expect(medio.imagem).toBeLessThan(310);
    conferir(medio, 800, 1032);
    // o zoom cresce com o texto
    expect(muito.largura).toBeGreaterThan(medidaZoom({ largura: 1672, altura: 1080 }, texto(3000)).largura);
  });

  it('texto enorme numa tela pequena: a coluna alarga até o limite e a letra diminui, sem cortar', () => {
    const m = medidaZoom({ largura: 1032, altura: 800 }, texto(900000));
    expect(m.modo).toBe('lado');
    expect(m.escala).toBeLessThan(1);
    expect(m.escala).toBeGreaterThanOrEqual(0.6);
    conferir(m, 800, 1032);
  });
});
