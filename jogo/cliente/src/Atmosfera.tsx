// Atmosfera das primeiras telas (entrar no servidor e escolher a mesa), por cima dos wallpapers: um mundo de
// trevas onde ainda há luz e vida. Brasas douradas sobem no escuro (a luz), alguns ciscos verdes flutuam (a vida)
// e um brilho quente respira no pé da tela. Tudo em CSS (estilo.css, "atmosfera"); com "reduzir movimento" no
// sistema, as brasas somem e o brilho para.

/** números pseudoaleatórios fixos: a mesma atmosfera a cada abertura, sem pular quando a tela redesenha */
function sorteio(semente: number): () => number {
  let s = semente;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

const BRASAS = (() => {
  const r = sorteio(20261008);
  return Array.from({ length: 34 }, (_, i) => {
    const vida = i % 6 === 5;
    return {
      vida,
      estilo: {
        '--x': `${(r() * 100).toFixed(1)}%`,
        '--t': `${(vida ? 16 : 9) + r() * 9}s`,
        '--d': `${-(r() * 18).toFixed(1)}s`,
        '--s': `${(vida ? 3 : 2) + r() * 3}px`,
        '--dx': `${(r() * 120 - 60).toFixed(0)}px`,
      },
    };
  });
})();

export function Atmosfera() {
  return (
    <div class="atmosfera" aria-hidden="true">
      <div class="aurora" />
      {BRASAS.map((b, i) => <span key={i} class={`brasa ${b.vida ? 'vida' : ''}`} style={b.estilo} />)}
    </div>
  );
}
