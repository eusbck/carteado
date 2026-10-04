// Paradas da passagem automática (CR 732): em que etapas o jogo espera você.

import { useState } from 'preact/hooks';
import type { StopSettings } from '../../../motor/autopass.ts';
import type { Step } from '../../../motor/types.ts';
import { loja } from '../loja.ts';
import { ETAPAS } from '../pt.ts';

const PARAVEIS = ETAPAS.filter((e) => !['untap', 'cleanup', 'firstStrikeDamage'].includes(e.id));

export function Paradas({ atual, fechar }: { atual: StopSettings; fechar: () => void }) {
  const [p, setP] = useState<StopSettings>(structuredClone(atual));
  const alternar = (lista: 'myTurn' | 'othersTurn', s: Step) => {
    const l = p[lista].includes(s) ? p[lista].filter((x) => x !== s) : [...p[lista], s];
    setP({ ...p, [lista]: l });
  };
  const salvar = () => { loja.enviar({ t: 'paradas', paradas: p }); fechar(); };
  return (
    <div class="modal" role="dialog" aria-label="Paradas">
      <div class="modal-caixa">
        <header class="modal-topo">
          <h2>Paradas automáticas</h2>
          <button class="botao" onClick={fechar}>Fechar</button>
        </header>
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
        <label class="caixa"><input type="checkbox" checked={p.stopOnOpponentStack} onChange={() => setP({ ...p, stopOnOpponentStack: !p.stopOnOpponentStack })} /> Parar quando um oponente põe algo na pilha</label>
        <label class="caixa"><input type="checkbox" checked={p.stopOnOwnStack} onChange={() => setP({ ...p, stopOnOwnStack: !p.stopOnOwnStack })} /> Parar para responder às minhas próprias mágicas e habilidades</label>
        <div class="botoes-linha"><button class="botao principal" onClick={salvar}>Salvar</button></div>
      </div>
    </div>
  );
}
