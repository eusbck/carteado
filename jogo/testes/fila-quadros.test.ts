// protocolo-2 e eventos-5 no cliente: a fila de quadros (cliente/src/mesa/filaQuadros.ts) mostra uma vista de cada vez,
// espera as animações do quadro (com teto), salta quando atrasa e não segura a decisão mais que o teto; a cena
// (cenaLoja.ts) avisa quem assina.
import { describe, expect, it } from 'vitest';
import { aoMudarCena, emCena, marcarCena, quadrosPendentes } from '../cliente/src/mesa/cenaLoja.ts';
import { ATRASO_MAX, FilaQuadros, MAX_FILA, SEM_NOTICIA, TETO_DECISAO, TETO_QUADRO, type Quadro, type Relogio } from '../cliente/src/mesa/filaQuadros.ts';

/** relógio falso: o tempo só anda com andar() */
class RelogioFalso implements Relogio {
  t = 0;
  private timers: { quando: number; f: () => void; id: number }[] = [];
  private n = 0;
  agora() { return this.t; }
  depois(f: () => void, ms: number) { const id = ++this.n; this.timers.push({ quando: this.t + ms, f, id }); return id; }
  cancelar(id: unknown) { this.timers = this.timers.filter((x) => x.id !== id); }
  andar(ms: number) {
    const fim = this.t + ms;
    for (;;) {
      this.timers.sort((a, b) => a.quando - b.quando || a.id - b.id);
      const prox = this.timers[0];
      if (!prox || prox.quando > fim) break;
      this.timers.shift();
      this.t = prox.quando;
      prox.f();
    }
    this.t = fim;
  }
}

interface Q extends Quadro { n: number }

function montar(mudou = true) {
  const r = new RelogioFalso();
  const mostrados: number[] = [];
  const estado = { fila: 0, animando: false };
  const f = new FilaQuadros<Q>((q) => { mostrados.push(q.n); return mudou; }, (fila, animando) => { estado.fila = fila; estado.animando = animando; }, r);
  const chega = (n: number, decisao = false, saltar = false) => f.receber({ n, chegada: r.agora(), decisao }, saltar);
  return { r, f, mostrados, estado, chega };
}

describe('fila de quadros (protocolo-2)', () => {
  it('mostra um quadro de cada vez: o seguinte só entra quando as animações do atual acabam', () => {
    const { r, f, mostrados, estado, chega } = montar();
    chega(1);
    expect(mostrados).toEqual([1]);
    expect(estado).toEqual({ fila: 0, animando: true });
    chega(2);
    chega(3);
    expect(mostrados).toEqual([1]);
    expect(f.pendentes).toBe(3);
    f.duracao(500);
    r.andar(499);
    expect(mostrados).toEqual([1]);
    r.andar(1);
    expect(mostrados).toEqual([1, 2]);
    f.duracao(0);
    expect(mostrados).toEqual([1, 2, 3]);
    f.duracao(300);
    r.andar(300);
    expect(estado).toEqual({ fila: 0, animando: false });
    expect(f.pendentes).toBe(0);
  });

  it('só a primeira notícia de duração vale, com teto; sem notícia, o quadro acaba sozinho', () => {
    const { r, mostrados, estado, f, chega } = montar();
    chega(1);
    f.duracao(5000);
    f.duracao(0); // uma segunda notícia (outro desenho) não encurta nem alonga
    r.andar(TETO_QUADRO - 1);
    expect(estado.animando).toBe(true);
    r.andar(1);
    expect(estado.animando).toBe(false);
    chega(2);
    expect(mostrados).toEqual([1, 2]);
    r.andar(SEM_NOTICIA);
    expect(estado.animando).toBe(false);
  });

  it('vista que não mudou nada não abre cena', () => {
    const { mostrados, estado, chega } = montar(false);
    chega(1);
    expect(mostrados).toEqual([1]);
    expect(estado).toEqual({ fila: 0, animando: false });
  });

  it('salta para o último com reinício, com a fila longa demais ou atrasada demais', () => {
    const a = montar();
    a.chega(1);
    a.chega(2);
    a.chega(3, false, true); // reinício: os de antes saem, sem cena
    expect(a.mostrados).toEqual([1, 3]);
    expect(a.estado).toEqual({ fila: 0, animando: false });

    const b = montar();
    b.chega(1);
    for (let n = 2; n <= MAX_FILA + 2; n++) b.chega(n);
    b.f.duracao(100);
    b.r.andar(100);
    expect(b.mostrados).toEqual([1, MAX_FILA + 2]);

    const c = montar();
    c.chega(1);
    c.f.duracao(500);
    c.chega(2);
    c.chega(3);
    c.r.andar(500); // o 1 acaba: o 2 entra (esperou 500 ms)
    expect(c.mostrados).toEqual([1, 2]);
    c.f.duracao(TETO_QUADRO);
    c.r.andar(500);
    c.chega(4);
    c.r.andar(TETO_QUADRO - 500);
    // o 3 esperava havia mais de ATRASO_MAX: sai, e entra o 4
    expect(c.mostrados).toEqual([1, 2, 4]);
  });

  it('o quadro com decisão vira o atual no máximo TETO_DECISAO depois de chegar, e a cena dele acaba', () => {
    const { r, f, mostrados, estado, chega } = montar();
    chega(1);
    f.duracao(800);
    r.andar(600);
    chega(2);
    chega(3, true);
    r.andar(200); // o 1 acaba em 800: o 2 entra
    expect(mostrados).toEqual([1, 2]);
    f.duracao(TETO_QUADRO);
    r.andar(TETO_DECISAO - 200);
    // o 3 chegou há TETO_DECISAO: entra já, sem cena (a do 2 acaba ali)
    expect(mostrados).toEqual([1, 2, 3]);
    expect(estado).toEqual({ fila: 0, animando: false });
  });

  it('pular mostra o último que chegou e encerra a cena', () => {
    const { f, mostrados, estado, chega } = montar();
    chega(1);
    chega(2);
    chega(3);
    f.pular();
    expect(mostrados).toEqual([1, 3]);
    expect(estado).toEqual({ fila: 0, animando: false });
    // a notícia atrasada do quadro pulado não abre cena
    f.duracao(800);
    expect(estado.animando).toBe(false);
  });
});

describe('cena (cenaLoja)', () => {
  it('emCena enquanto há fila ou animação; avisa só quando muda', () => {
    let avisos = 0;
    const sair = aoMudarCena(() => avisos++);
    marcarCena(0, false);
    expect(emCena()).toBe(false);
    marcarCena(0, true);
    expect(emCena()).toBe(true);
    marcarCena(0, true);
    marcarCena(2, true);
    expect(quadrosPendentes()).toBe(3);
    marcarCena(0, false);
    expect(emCena()).toBe(false);
    expect(avisos).toBe(3);
    sair();
    marcarCena(1, false);
    expect(avisos).toBe(3);
    marcarCena(0, false);
  });
});
