// As cartas do palco do Como jogar: desenho próprio, chapado e grande (moldura na cor, silhueta na arte, caixa de
// texto clara, custo e poder/resistência), feito para ler de longe. A imagem de uma carta de verdade aparece só no
// "Como ler uma carta".

import type { Arte, Icone } from './filme.ts';

const ICONES: Record<Icone, string> = {
  arvore: 'M12 1.5 4.5 11h3.8L5 16h5.6v6.5h2.8V16H19l-3.3-5h3.8z',
  sol: 'M12 7.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6zM11 1h2l-.4 4h-1.2zM11 23h2l-.4-4h-1.2zM1 11v2l4-.4v-1.2zM23 11v2l-4-.4v-1.2zM3.5 5l1.4-1.4 2.6 3.1-.8.8zM20.5 19l-1.4 1.4-2.6-3.1.8-.8zM5 20.5 3.6 19.1l3.1-2.6.8.8zM19 3.5l1.4 1.4-3.1 2.6-.8-.8z',
  elfo: 'M12 2.5c1.9 0 3.3 1.5 3.3 3.4 0 .6-.1 1.1-.4 1.6l3.6-1.9-2.6 3.2c-.8 1-2.3 1.6-3.9 1.6s-3.1-.6-3.9-1.6L5.5 5.6l3.6 1.9a3.4 3.4 0 0 1 2.9-5zM8 11.6h8l2.6 10.9H5.4z',
  anjo: 'M12 3.4a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8zM10.4 9.2h3.2l1.4 13H9zM9.6 10C7 6.6 3.4 5.4.6 6.6c2.2 1.3 3.6 4.5 8.6 6.2zM14.4 10c2.6-3.4 6.2-4.6 9-3.4-2.2 1.3-3.6 4.5-8.6 6.2z',
  espada: 'M17.6 1.8h4.6v4.6L11 17.6l-1.2-1.2-2 2 1.4 1.4-1.6 1.6-1.4-1.4-2.6 2.6-2.4-2.4 2.6-2.6-1.4-1.4 1.6-1.6 1.4 1.4 2-2-1.2-1.2z',
  fera: 'M3 2.5l4.6 5.2h8.8L21 2.5l-1.6 8.4 1.6 3.1-3.4 2.4-1.2 4.6h-8.8l-1.2-4.6L3 14l1.6-3.1zM9 12a1.3 1.3 0 1 0 0 2.6A1.3 1.3 0 0 0 9 12zm6 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z',
  lobo: 'M4 3l4 5 3-1 3 1 4-5-.6 7.4 2.6 4.6-4 1.2L14 21h-4l-2-4.8L4 15l2.6-4.6z',
  escudo: 'M12 1.5 21 5v6.5c0 5.4-3.8 9.6-9 11-5.2-1.4-9-5.6-9-11V5z',
  coroa: 'M2.5 7.5 7.4 12 12 4l4.6 8 4.9-4.5L19.6 19H4.4zM4.4 20.4h15.2V23H4.4z',
  raio: 'M13.6 1 4.5 13.6h6.3L9.4 23 19.5 9.8h-6.6z',
  onda: 'M1 14.2c3-3.4 5.6-3.4 8.4 0s5.6 3.4 8.4 0c1.6-1.8 3.2-2.6 5.2-2.6v4.4c-1.6 0-2.8.8-4 2.2-3.4 3.8-6.6 3.8-9.8 0-2.4-2.8-4.4-2.8-6.8 0z',
};

export function CartaArte({ arte }: { arte: Arte }) {
  return (
    <div class={`ca ca-${arte.cor} ${arte.terreno ? 'terreno' : ''} ${arte.lenda ? 'lenda' : ''}`}>
      <div class="ca-nome" />
      {arte.custo && (
        <div class="ca-custo">{arte.custo.map((c, i) => <i key={i} class={`pip pip-${/\d/.test(c) ? 'n' : c}`}>{/\d/.test(c) ? c : ''}</i>)}</div>
      )}
      <div class="ca-arte"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONES[arte.icone]} /></svg></div>
      <div class="ca-texto">
        {arte.terreno ? <i class={`pip grande pip-${arte.cor}`} /> : <><b /><b /><b class="curta" /></>}
      </div>
      {arte.pt && <div class="ca-pt">{arte.pt}</div>}
    </div>
  );
}
