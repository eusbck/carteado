import { useLoja } from './loja.ts';
import { Entrada } from './telas/Entrada.tsx';
import { Inicio } from './telas/Inicio.tsx';
import { Saguao } from './telas/Saguao.tsx';
import { Mesa } from './mesa/Mesa.tsx';

export function App() {
  const e = useLoja();
  let tela;
  if (e.fase === 'carregando') tela = <div class="centro">Carregando…</div>;
  else if (e.fase === 'entrada') tela = <Entrada />;
  else if (e.fase === 'inicio') tela = <Inicio />;
  else if (e.vista && e.sala && e.sala.estado !== 'espera') tela = <Mesa />;
  else tela = <Saguao />;
  return (
    <>
      {tela}
      {e.erro && <div class="aviso-erro" role="alert">{e.erro}</div>}
      {e.fase !== 'entrada' && e.fase !== 'carregando' && !e.conectado && <div class="aviso-conexao">Reconectando ao servidor…</div>}
    </>
  );
}
