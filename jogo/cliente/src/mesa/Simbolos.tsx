import { simbolos } from '../cartas.ts';

/** custo ou mana em texto ("{2}{W}{U/R}") como símbolos */
export function Simbolos({ custo, tam = 16 }: { custo: string; tam?: number }) {
  const lista = simbolos(custo);
  if (lista.length === 0) return null;
  return (
    <span class="simbolos" aria-label={custo}>
      {lista.map((s, i) => <img key={i} src={`/simbolo/${s}`} width={tam} height={tam} alt={`{${s}}`} />)}
    </span>
  );
}

/** texto com símbolos embutidos ("{T}: Adicione {G}.") */
export function TextoComSimbolos({ texto }: { texto: string }) {
  const partes = texto.split(/(\{[^}]+\})/g);
  return (
    <>
      {partes.map((p, i) => (/^\{[^}]+\}$/.test(p) ? <Simbolos key={i} custo={p} tam={14} /> : <span key={i}>{p}</span>))}
    </>
  );
}
