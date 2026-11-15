// Earthbender Ascension
// When this enchantment enters, earthbend 2. Then search your library for a basic land card, put it onto the
// battlefield tapped, then shuffle.
// Landfall — Whenever a land you control enters, put a quest counter on this enchantment. When you do, if it has
// four or more quest counters on it, put a +1/+1 counter on target creature you control. It gains trample until end of turn.
import {
  addCounters, defineAbility, defineCard, earthbend, etb, is, isBasicLand, lkiObj, on, reflexive,
  searchTo, t, tgt, triggered, untilEndOfTurn,
} from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

// CR 603.4, 603.12: o "se" do gatilho reflexivo é conferido ao disparar e novamente ao resolver.
// CR 608.2h: se o encantamento saiu do campo, usa sua última informação conhecida.
const completouMissao = (c: SCtx): boolean => (lkiObj(c.g, c.source)?.counters.quest ?? 0) >= 4;
const PREMIO = defineAbility('Earthbender Ascension:missao', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const id = tgt(c);
  if (id === null) return;
  addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
  untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'trample' }]);
}, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], condition: completouMissao, text: 'Quando fizer isso, se este encantamento tiver quatro ou mais marcadores de missão, coloque um marcador +1/+1 na criatura alvo que você controla. Ela ganha atropelar até o fim do turno.' }));

export default defineCard({
  name: 'Earthbender Ascension',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id === null) return;
        yield* earthbend(c, id, 2);
        yield* searchTo(c, c.you, (carta) => isBasicLand(c.g, carta), 1, 'battlefield', { tapped: true, prompt: 'Procure uma carta de terreno básico' });
      }, { targets: [t.land(is.yours, 'terreno alvo que você controla')], text: 'Quando este encantamento entra, dobre a terra 2. Depois procure no seu grimório uma carta de terreno básico, coloque-a no campo virada e embaralhe.' }),
      triggered(on.landfall(), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        const colocados = addCounters(c.g, { kind: 'obj', id: c.source }, 'quest', 1, c.you);
        if (colocados > 0 && completouMissao(c)) reflexive(c, PREMIO.id!);
      }, { text: 'Aterragem — Sempre que um terreno que você controla entra, coloque um marcador de missão neste encantamento. Quando fizer isso, se ele tiver quatro ou mais marcadores de missão, coloque um marcador +1/+1 na criatura alvo que você controla. Ela ganha atropelar até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.66a — só retorna se morrer ou for exilado (motor/terra.ts; testes/regras-dobrar-terra.test.ts)',
    2: 'teste: dobra um terreno existente e depois busca um básico virado, disparando aterragem',
    3: 'regra geral: CR 701.66a — pode dobrar um terreno que já é criatura (motor/terra.ts; testes/regras-dobrar-terra.test.ts)',
    4: 'teste: CR 608.2b: se o terreno alvo fica ilegal, nem dobra a terra nem busca',
    5: 'teste: o terreno buscado ainda não está entre os alvos de dobrar a terra',
    6: 'regra geral: CR 701.66a — conserva tipos e habilidades de mana (motor/terra.ts; cartas/defs/ba-sing-se.test.ts)',
    7: 'regra geral: CR 701.66a — dobrar a terra não atribui cor (motor/terra.ts; testes/regras-dobrar-terra.test.ts)',
  },
});
