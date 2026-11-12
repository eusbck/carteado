// Marcar em cima de uma imagem do relato: caneta, caixa e seta, em três cores, com desfazer. Salvar junta as marcas
// à imagem (a original não vai junto).

import { useEffect, useRef, useState } from 'preact/hooks';
import { Janela } from '../Janela.tsx';
import { canvasParaDados } from './captura.ts';

type Ponto = [number, number];
type Ferramenta = 'caixa' | 'seta' | 'caneta';
type Traco = { f: 'caneta'; cor: string; pontos: Ponto[] } | { f: 'caixa' | 'seta'; cor: string; de: Ponto; ate: Ponto };

const CORES = [
  { cor: '#ff3b3b', nome: 'Vermelho' },
  { cor: '#ffd23b', nome: 'Amarelo' },
  { cor: '#3be3ff', nome: 'Azul' },
];
const FERRAMENTAS: { id: Ferramenta; nome: string; dica: string }[] = [
  { id: 'caixa', nome: 'Caixa', dica: 'Arraste para cercar o que está errado' },
  { id: 'seta', nome: 'Seta', dica: 'Arraste da ponta de trás até onde ela aponta' },
  { id: 'caneta', nome: 'Caneta', dica: 'Desenhe livre' },
];

function desenhar(ctx: CanvasRenderingContext2D, t: Traco, espessura: number): void {
  ctx.strokeStyle = t.cor;
  ctx.fillStyle = t.cor;
  ctx.lineWidth = espessura;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // contorno escuro por baixo: a marca aparece sobre qualquer fundo
  ctx.shadowColor = 'rgba(0, 0, 0, .7)';
  ctx.shadowBlur = espessura * 1.2;
  ctx.beginPath();
  if (t.f === 'caneta') {
    t.pontos.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    if (t.pontos.length === 1) ctx.lineTo(t.pontos[0][0] + 0.1, t.pontos[0][1]);
    ctx.stroke();
  } else if (t.f === 'caixa') {
    ctx.strokeRect(Math.min(t.de[0], t.ate[0]), Math.min(t.de[1], t.ate[1]), Math.abs(t.ate[0] - t.de[0]), Math.abs(t.ate[1] - t.de[1]));
  } else {
    const [x1, y1] = t.de, [x2, y2] = t.ate;
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const ponta = espessura * 5;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2 - Math.cos(ang) * ponta * 0.6, y2 - Math.sin(ang) * ponta * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - ponta * Math.cos(ang - 0.45), y2 - ponta * Math.sin(ang - 0.45));
    ctx.lineTo(x2 - ponta * Math.cos(ang + 0.45), y2 - ponta * Math.sin(ang + 0.45));
    ctx.closePath();
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

export function Marcador({ dados, salvar, cancelar }: { dados: string; salvar: (novos: string) => void; cancelar: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [tracos, setTracos] = useState<Traco[]>([]);
  const [ferramenta, setFerramenta] = useState<Ferramenta>('caixa');
  const [cor, setCor] = useState(CORES[0].cor);
  const atual = useRef<Traco | null>(null);
  const [, redesenhar] = useState(0);

  useEffect(() => {
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = dados;
  }, [dados]);

  const espessura = img ? Math.max(3, Math.round(Math.max(img.width, img.height) / 320)) : 4;

  useEffect(() => {
    const c = canvas.current;
    if (!c || !img) return;
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    for (const t of tracos) desenhar(ctx, t, espessura);
    if (atual.current) desenhar(ctx, atual.current, espessura);
  });

  // Ctrl+Z desfaz a última marca
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); setTracos((l) => l.slice(0, -1)); }
    };
    addEventListener('keydown', tecla);
    return () => removeEventListener('keydown', tecla);
  }, []);

  const ponto = (e: PointerEvent): Ponto => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * c.width, ((e.clientY - r.top) / r.height) * c.height];
  };
  const comecar = (e: PointerEvent) => {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = ponto(e);
    atual.current = ferramenta === 'caneta' ? { f: 'caneta', cor, pontos: [p] } : { f: ferramenta, cor, de: p, ate: p };
    redesenhar((n) => n + 1);
  };
  const mover = (e: PointerEvent) => {
    const t = atual.current;
    if (!t) return;
    const p = ponto(e);
    if (t.f === 'caneta') t.pontos.push(p);
    else t.ate = p;
    redesenhar((n) => n + 1);
  };
  const soltar = () => {
    const t = atual.current;
    atual.current = null;
    if (!t) return;
    // um clique sem arrastar na caixa ou na seta não vira marca
    const pequeno = t.f !== 'caneta' && Math.hypot(t.ate[0] - t.de[0], t.ate[1] - t.de[1]) < espessura * 2;
    if (!pequeno) setTracos((l) => [...l, t]);
    else redesenhar((n) => n + 1);
  };

  return (
    <Janela titulo="Marcar na imagem" larga classe="marcador" fechar={cancelar}>
      <div class="marcador-barra">
        <div class="marcador-grupo" role="radiogroup" aria-label="Ferramenta">
          {FERRAMENTAS.map((f) => (
            <button key={f.id} type="button" role="radio" aria-checked={ferramenta === f.id} class={`botao pequeno ${ferramenta === f.id ? 'ativo' : ''}`} title={f.dica} onClick={() => setFerramenta(f.id)}>{f.nome}</button>
          ))}
        </div>
        <div class="marcador-grupo" role="radiogroup" aria-label="Cor">
          {CORES.map((c) => (
            <button key={c.cor} type="button" role="radio" aria-checked={cor === c.cor} aria-label={c.nome} title={c.nome} class={`marcador-cor ${cor === c.cor ? 'ativa' : ''}`} style={{ '--cor': c.cor }} onClick={() => setCor(c.cor)} />
          ))}
        </div>
        <div class="marcador-grupo">
          <button type="button" class="botao pequeno" disabled={!tracos.length} onClick={() => setTracos((l) => l.slice(0, -1))} title="Desfazer (Ctrl+Z)">Desfazer</button>
          <button type="button" class="botao pequeno" disabled={!tracos.length} onClick={() => setTracos([])}>Limpar</button>
        </div>
      </div>
      <div class="marcador-area">
        {img ? <canvas ref={canvas} onPointerDown={comecar} onPointerMove={mover} onPointerUp={soltar} onPointerCancel={soltar} aria-label="Imagem para marcar" /> : <p class="suave">Carregando…</p>}
      </div>
      <div class="botoes-linha relato-acoes">
        <span class="suave relato-dica">{FERRAMENTAS.find((f) => f.id === ferramenta)?.dica}</span>
        <button type="button" class="botao" onClick={cancelar}>Cancelar</button>
        <button type="button" class="botao cheio" disabled={!img} onClick={() => salvar(tracos.length && canvas.current ? canvasParaDados(canvas.current) : dados)}>Usar esta imagem</button>
      </div>
    </Janela>
  );
}
