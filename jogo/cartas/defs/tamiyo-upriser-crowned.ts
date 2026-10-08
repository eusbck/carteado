// Tamiyo, Upriser Crowned
// Flying, double strike, haste
// When Tamiyo enters, you become the monarch.
// Whenever one or more creatures deal combat damage to you while you're the monarch, tap those creatures and put a stun
// counter on each of them.
import { addCounters, becomeMonarch, defineCard, etb, keywords, lkiChars, on, tap, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Tamiyo, Upriser Crowned',
  faces: [{
    abilities: [
      ...keywords('flying', 'double strike', 'haste'),
      etb(function* (c) { becomeMonarch(c.g, c.you); }, { text: 'Quando Tamiyo entra, você se torna o monarca.' }),
      // "um ou mais": um disparo por lote de dano de combate simultâneo (CR 603.2c, 510.2); "enquanto você for o monarca"
      // é condição de disparo, vista quando o dano é causado (antes de o monarca mudar pelo dano, CR 725.2)
      triggered(on.batch((evs, c) => {
        if (c.g.state.monarch !== c.you) return false;
        const criaturas = [...new Set(evs.flatMap((e) => (e.type === 'damage' && e.combat && e.target.kind === 'player' && e.target.id === c.you && !!lkiChars(c.g, e.source)?.types.includes('Creature') ? [e.source] : [])))];
        return criaturas.length ? { criaturas } : false;
      }), function* (c) {
        // CR 122.1d: o marcador de atordoamento impede a próxima vez que a criatura desviraria
        for (const id of c.event.criaturas as number[]) {
          if (c.g.state.objects[id]?.zone !== 'battlefield') continue;
          tap(c.g, id);
          addCounters(c.g, { kind: 'obj', id }, 'stun', 1, c.you);
        }
      }, { text: 'Sempre que uma ou mais criaturas causarem dano de combate a você enquanto você for o monarca, vire essas criaturas e coloque um marcador de atordoamento em cada uma delas.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 725.3 (motor) — só um monarca por vez; quem se torna monarca tira o título do anterior',
    2: 'regra geral: CR 725.4, 800.4a (motor) — se o monarca perde pelo dano, o jogador ativo passa a ser o monarca (testes/regras-veneno-emblema-atordoar.test.ts)',
    3: 'regra geral: CR 725.2 (motor) — a compra do monarca já disparada é de quem era o monarca',
    4: 'regra geral: CR 725.4 (motor) — monarca que sai da partida passa o título (testes/regras-veneno-emblema-atordoar.test.ts)',
    5: 'teste: dano de combate de Bruno: as criaturas são viradas e atordoadas, e Bruno passa a ser o monarca',
  },
});
