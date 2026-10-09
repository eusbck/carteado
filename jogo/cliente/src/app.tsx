import { useEffect } from 'preact/hooks';
import { lazy, Suspense } from 'preact/compat';
import { Atmosfera } from './Atmosfera.tsx';
import { FundoArte } from './FundoArte.tsx';
import { useLoja } from './loja.ts';
import { quandoOcioso } from './ocioso.ts';
import { Entrada } from './telas/Entrada.tsx';
import { Inicio } from './telas/Inicio.tsx';
import { Saguao } from './telas/Saguao.tsx';
import { Mesa } from './mesa/Mesa.tsx';

// a tela Decks (importar e atualizar pelo Moxfield) fica fora do pacote inicial: o código vem com a página parada,
// depois da tela inicial ou do saguão (os dois têm o botão Decks), e o clique quase nunca chega a ver o "Carregando…"
const carregarDecks = () => import('./telas/Decks.tsx');
const Decks = lazy(() => carregarDecks().then((m) => ({ default: m.Decks })));

export function App() {
  const e = useLoja();
  const antesDosDecks = e.fase === 'inicio' || e.fase === 'sala';
  useEffect(() => (antesDosDecks ? quandoOcioso(() => void carregarDecks()) : undefined), [antesDosDecks]);
  let tela;
  // os wallpapers ficam atrás das telas de fora da mesa (a mesa tem a arte do comandante de cada um)
  let fundo = true;
  if (e.fase === 'carregando') { tela = <div class="centro">Carregando…</div>; fundo = false; }
  else if (e.fase === 'entrada') tela = <Entrada />;
  else if (e.fase === 'inicio') tela = <Inicio />;
  // enquanto o código chega: o mesmo fundo da tela Decks (por cima dos wallpapers) com o "Carregando…" do começo
  else if (e.fase === 'decks') tela = <Suspense fallback={<div class="tela-fundo"><p class="suave">Carregando…</p></div>}><Decks /></Suspense>;
  else if (e.vista && e.sala && e.sala.estado !== 'espera') { tela = <Mesa />; fundo = false; }
  else tela = <Saguao />;
  return (
    <>
      {/* a entrada no servidor tem as duas imagens dela; as outras telas, a coleção inteira (trocar de uma para a outra
          recomeça o fundo) */}
      {fundo && <FundoArte key={e.fase === 'entrada' ? 'entrada' : 'geral'} colecao={e.fase === 'entrada' ? 'entrada' : 'geral'} />}
      {/* as primeiras telas ganham a atmosfera (brasas subindo) por cima dos wallpapers */}
      {(e.fase === 'entrada' || e.fase === 'inicio') && <Atmosfera />}
      {tela}
      {e.erro && <div class="aviso-erro" role="alert">{e.erro}</div>}
      {e.fase !== 'entrada' && e.fase !== 'carregando' && !e.conectado && <div class="aviso-conexao">Reconectando ao servidor…</div>}
    </>
  );
}
