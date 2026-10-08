// Hofri Ghostforge
// Spirits you control get +1/+1 and have trample and haste.
// Whenever another nontoken creature you control dies, exile it. If you do, create a token that's a copy of that
// creature, except it's a Spirit in addition to its other types and it has "When this token leaves the battlefield,
// return the exiled card to its owner's graveyard."
import { copiableValues, createTokens, defineAbility, defineCard, exile, isCreature, isSubtype, moveObjects, on, staticAbility, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// habilidade concedida à ficha; ruling 5: ligada só ao card exilado por esta resolução (dado do objeto, não copiável)
const VOLTA = defineAbility('Hofri Ghostforge:volta', triggered(on.selfLeaves(), function* (c) {
  const carta = (c.g.state.objects[c.source]?.data.hofriCarta ?? c.g.state.lki[c.source]?.obj.data.hofriCarta) as ObjId | undefined;
  if (carta !== undefined && c.g.state.objects[carta]?.zone === 'exile') yield* moveObjects(c.g, [{ id: carta, to: 'graveyard' }], 'effect');
}, { text: 'Quando esta ficha sai do campo, devolva a carta exilada ao cemitério do dono.' }));

export default defineCard({
  name: 'Hofri Ghostforge',
  faces: [{
    abilities: [
      staticAbility({
        affects: (c, o) => o.zone === 'battlefield' && o.controller === c.you && isCreature(c.g, o.id) && isSubtype(c.g, o.id, 'Spirit'),
        mods: () => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'trample' }, { k: 'addKeyword', kw: 'haste' }],
        text: 'Os Spirits que você controla recebem +1/+1 e têm atropelar e ímpeto.',
      }),
      triggered(on.dies((c, l, o) => o.id !== c.source && !o.isToken && l.controller === c.you), function* (c) {
        const velho = c.event.old as ObjId;
        const carta = c.g.state.lki[velho]?.newId ?? null;
        // ruling 8: sem conseguir exilar, sem ficha
        if (carta === null || c.g.state.objects[carta]?.zone !== 'graveyard') return;
        // ruling 2: valores copiáveis da última vez no campo
        const base = copiableValues(c.g, velho);
        const [exilada] = yield* exile(c.g, [carta]);
        if (exilada === null || exilada === undefined) return;
        const except = { ...base.except, addSubtypes: [...(base.except?.addSubtypes ?? []), 'Spirit'], addAbilities: [...(base.except?.addAbilities ?? []), VOLTA.id!] };
        yield* createTokens(c.g, c.you, { copyOf: { ...base, except } }, 1, { data: { hofriCarta: exilada } });
      }, { text: 'Sempre que outra criatura que não é ficha que você controla morre, exile-a. Se fizer isso, crie uma ficha que é cópia dela, exceto que é um Spirit além dos outros tipos e tem "Quando esta ficha sai do campo, devolva a carta exilada ao cemitério do dono."' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.5 — a ficha cópia dispara as próprias habilidades de entrar',
    2: 'teste: copia a criatura como estava no campo',
    3: 'não se aplica: nenhum efeito de substituição dos decks dobra fichas',
    4: 'regra geral: CR 607.2a — a ligação fica no dado do objeto, que não é copiável',
    5: 'teste: quando a ficha sai, a carta exilada volta ao cemitério',
    6: 'regra geral: CR 707.2 — só valores copiáveis; marcadores e Auras não',
    7: 'regra geral: CR 707.3 — copia o que a criatura estava copiando',
    8: 'teste: sem a carta no cemitério, não cria ficha',
  },
});
