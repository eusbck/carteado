// Configurações › Efeitos e sons, e Música: volume dos efeitos, cada som (os dois de turno
// separados, com um botão para ouvir), efeitos visuais, e a música de fundo com volume próprio e o
// crédito da faixa. Tudo guardado neste navegador e valendo na hora, no meio da partida.

import { FAIXA } from '../musica.ts';
import { mudarPreferencias, type Preferencias, type Som } from '../preferencias.ts';
import { ouvir } from '../sons.ts';
import './config-som.css';

const SONS: { id: Som; nome: string; descricao?: string }[] = [
  { id: 'turnoMeu', nome: 'Som do seu turno', descricao: 'trompas: avisa que é a sua vez' },
  { id: 'turnoAdversario', nome: 'Som do turno de um adversário', descricao: 'harpa, mais discreta' },
  { id: 'dano', nome: 'Som de dano' },
  { id: 'vida', nome: 'Som de ganhar vida' },
  { id: 'chat', nome: 'Som de mensagem no chat', descricao: 'quando outra pessoa escreve' },
  { id: 'abertura', nome: 'Som da abertura', descricao: 'o impacto do VS quando a partida começa' },
];

const IconeOuvir = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></svg>
);

function Volume({ id, rotulo, valor, desligado, mudar }: { id: string; rotulo: string; valor: number; desligado?: boolean; mudar: (v: number) => void }) {
  return (
    <label class={`volume ${desligado ? 'travado' : ''}`}>
      <span>{rotulo}</span>
      <input type="range" id={id} min="0" max="100" step="5" value={Math.round(valor * 100)} disabled={desligado} onInput={(ev) => mudar(Number((ev.target as HTMLInputElement).value) / 100)} />
      <output>{Math.round(valor * 100)}%</output>
    </label>
  );
}

export function ConfigSom({ pref }: { pref: Preferencias }) {
  return (
    <>
      <section class="bloco-config" aria-labelledby="cfg-sons">
        <p class="rot" id="cfg-sons">Efeitos e sons <span class="rot-nota">valem em qualquer sala</span></p>
        <Volume id="cfg-volume" rotulo="Volume dos efeitos" valor={pref.volume} mudar={(volume) => mudarPreferencias({ volume })} />
        <div class="sons sons-lista">
          {SONS.map((s) => (
            <div key={s.id} class="som-linha">
              <label class="caixa">
                <input type="checkbox" id={`cfg-som-${s.id}`} checked={pref.sons[s.id]} onChange={() => mudarPreferencias({ sons: { ...pref.sons, [s.id]: !pref.sons[s.id] } })} />
                <span>{s.nome}{s.descricao && <small>{s.descricao}</small>}</span>
              </label>
              <button type="button" class="ouvir" title={`Ouvir: ${s.nome.toLowerCase()}`} aria-label={`Ouvir: ${s.nome.toLowerCase()}`} onClick={() => ouvir(s.id)}><IconeOuvir /></button>
            </div>
          ))}
          <label class="caixa"><input type="checkbox" id="cfg-efeitos" checked={pref.efeitos} onChange={() => mudarPreferencias({ efeitos: !pref.efeitos })} /> Efeitos visuais (tremida, brilho, números)</label>
        </div>
        <p class="suave">Com "reduzir movimento" ligado no sistema, os efeitos ficam sem tremida nem deslocamento.</p>
      </section>
      <section class="bloco-config" aria-labelledby="cfg-musica-rot">
        <p class="rot" id="cfg-musica-rot">Música <span class="rot-nota">guardado neste navegador</span></p>
        <label class="caixa"><input type="checkbox" id="cfg-musica" checked={pref.musica} onChange={() => mudarPreferencias({ musica: !pref.musica })} /> Música de fundo durante a partida</label>
        <Volume id="cfg-volume-musica" rotulo="Volume da música" valor={pref.volumeMusica} desligado={!pref.musica} mudar={(volumeMusica) => mudarPreferencias({ volumeMusica })} />
        <p class="credito-musica">
          “<a href={FAIXA.pagina} target="_blank" rel="noopener noreferrer">{FAIXA.titulo}</a>”, de {FAIXA.autor}
          {' · '}<a href={FAIXA.licencaUrl} target="_blank" rel="noopener noreferrer">{FAIXA.licenca}</a>
          {FAIXA.nota && <> · {FAIXA.nota}</>}
        </p>
      </section>
    </>
  );
}
