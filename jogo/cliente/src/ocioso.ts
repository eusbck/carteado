// Telas carregadas sob demanda (a tela Decks e a prévia do deck ficam fora do pacote inicial): o código delas vem
// quando o navegador está parado, logo depois da tela que leva até elas aparecer, para o clique não esperar a rede.

/** roda `f` quando o navegador estiver ocioso (ou em até 2 s); devolve a função que cancela */
export function quandoOcioso(f: () => void): () => void {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(f, { timeout: 2000 });
    return () => cancelIdleCallback(id);
  }
  const t = setTimeout(f, 300);
  return () => clearTimeout(t);
}
