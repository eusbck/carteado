// Paradas da passagem automática (CR 732): em que etapas o jogo espera você.

import { useState } from 'preact/hooks';
import type { StopSettings } from '../../../motor/autopass.ts';
import type { Step } from '../../../motor/types.ts';
import { Janela } from '../Janela.tsx';
import { loja } from '../loja.ts';
import { ETAPAS } from '../pt.ts';

const PARAVEIS = ETAPAS.filter((e) => !['untap', 'cleanup', 'firstStrikeDamage'].includes(e.id));

export function Paradas({ atual, fechar }: { atual: StopSettings; fechar: () => void }) {
  // a cópia só na abertura (como argumento direto, structuredClone rodava a cada desenho e era jogado fora)
  const [p, setP] = useState<StopSettings>(() => structuredClone(atual));
  const alternar = (lista: 'myTurn' | 'othersTurn', s: Step) => {
    const l = p[lista].includes(s) ? p[lista].filter((x) => x !== s) : [...p[lista], s];
    setP({ ...p, [lista]: l });
  };
  const salvar = () => { loja.enviar({ t: 'paradas', paradas: p }); fechar(); };
  return (
    <Janela titulo="Paradas automáticas" fechar={fechar}>
      <p class="suave">Fora destas etapas, o jogo passa a prioridade por você quando a pilha está vazia. Decisões como alvos, bloqueios e pagamentos sempre esperam você.</p>
      <table class="tabela-paradas">
        <thead><tr><th>Etapa</th><th>No meu turno</th><th>No turno dos outros</th></tr></thead>
        <tbody>
          {PARAVEIS.map((e) => (
            <tr key={e.id}>
              <td>{e.nome}</td>
              <td><input type="checkbox" checked={p.myTurn.includes(e.id as Step)} onChange={() => alternar('myTurn', e.id as Step)} aria-label={`${e.nome}, meu turno`} /></td>
              <td><input type="checkbox" checked={p.othersTurn.includes(e.id as Step)} onChange={() => alternar('othersTurn', e.id as Step)} aria-label={`${e.nome}, turno dos outros`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* a parada inteligente vale mesmo sem as etapas marcadas (ausente nas salas antigas = ligada, como no servidor) */}
      <label class="caixa"><input type="checkbox" checked={p.respondWhenAble !== false} onChange={() => setP({ ...p, respondWhenAble: p.respondWhenAble === false })} /> Parar quando eu puder responder: com algo instantâneo para jogar, a mesa espera você quando um oponente põe algo na pilha, ataca ou chega na etapa final</label>
      <label class="caixa"><input type="checkbox" checked={p.stopOnOpponentStack} onChange={() => setP({ ...p, stopOnOpponentStack: !p.stopOnOpponentStack })} /> Parar sempre que um oponente põe algo na pilha (mesmo sem jogada)</label>
      <label class="caixa"><input type="checkbox" checked={p.stopOnOwnStack} onChange={() => setP({ ...p, stopOnOwnStack: !p.stopOnOwnStack })} /> Parar para responder às minhas próprias mágicas e habilidades</label>
      <div class="botoes-linha"><button class="botao principal" onClick={salvar}>Salvar</button></div>
    </Janela>
  );
}
