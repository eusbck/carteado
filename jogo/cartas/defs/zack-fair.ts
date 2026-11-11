// Zack Fair
// Zack Fair enters with a +1/+1 counter on it.
// {1}, Sacrifice Zack Fair: Target creature you control gains indestructible until end of turn. Put Zack Fair's counters
// on that creature and attach an Equipment that was attached to Zack Fair to that creature.
import { activated, addCounters, attach, chars, chooseItems, defineCard, entersWithCounters, is, lkiObj, nameOf, objItem, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Zack Fair',
  faces: [{
    abilities: [
      entersWithCounters('+1/+1', 1),
      activated('{1}, Sacrifice this creature', function* (c) {
        const alvo = tgt(c);
        if (alvo === null) return;
        untilEndOfTurn(c, [alvo], [{ k: 'addKeyword', kw: 'indestructible' }]);
        // rulings 1 e 3: põe a mesma quantidade de cada tipo de marcador que Zack tinha ao ser sacrificado (todos os tipos)
        const zack = lkiObj(c.g, c.source);
        for (const [tipo, n] of Object.entries(zack?.counters ?? {})) if (n > 0) addCounters(c.g, { kind: 'obj', id: alvo }, tipo, n, c.you);
        // o que estava anexado a Zack ao pagar o custo (motor/costs.ts guarda em costInfo.attachments)
        const anexos = ((c.data.costInfo as { attachments?: ObjId[] } | undefined)?.attachments ?? [])
          .filter((id) => c.g.state.objects[id]?.zone === 'battlefield' && chars(c.g, id).subtypes.includes('Equipment'));
        if (!anexos.length || c.g.state.objects[alvo]?.zone !== 'battlefield') return;
        let eq = anexos[0];
        if (anexos.length > 1) {
          const esc = yield* chooseItems(c.g, c.you, 'Zack Fair: escolha o Equipamento a anexar', anexos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
          eq = Number(esc[0]);
        }
        attach(c.g, eq, alvo);
      }, {
        targets: [t.creature(is.yours, 'criatura alvo que você controla')],
        text: '{1}, sacrifique Zack Fair: a criatura alvo que você controla ganha indestrutível até o fim do turno. Coloque os marcadores de Zack Fair nessa criatura e anexe a ela um Equipamento que estava anexado a Zack Fair.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: põe todos os marcadores de Zack (não só os +1/+1) na criatura alvo',
    2: 'regra geral: os marcadores não são movidos, são postos de novo (ruling 3); outro efeito que também os ponha (The Ozolith) funciona junto',
    3: 'teste: põe todos os marcadores de Zack (não só os +1/+1) na criatura alvo',
  },
});
