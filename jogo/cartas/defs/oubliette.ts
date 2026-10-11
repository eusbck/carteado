// Oubliette
// When this enchantment enters, target creature phases out until this enchantment leaves the battlefield. Tap that
// creature as it phases in this way. (Auras and Equipment phase out with it. While permanents are phased out, they're
// treated as though they don't exist.)
import { defineCard, emit, etb, lkiObj, on, phaseOut, t, tgt, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';

const CHAVE = 'masmorra';

/** a permanente e tudo o que está anexado a ela, direta ou indiretamente (CR 702.26g) */
function comAnexos(g: G, id: ObjId): ObjId[] {
  const s = g.state;
  const out = [id];
  for (let i = 0; i < out.length; i++) for (const a of s.zones.battlefield) if (s.objects[a].attachedTo === out[i] && !out.includes(a)) out.push(a);
  return out;
}

export default defineCard({
  name: 'Oubliette',
  faces: [{
    abilities: [
      etb(function* (c) {
        const s = c.g.state;
        const id = tgt(c);
        const o = s.objects[c.source];
        // ruling 1: se Oubliette já saiu do campo, a criatura não sai de fase
        if (id === null || !o || o.zone !== 'battlefield') return;
        phaseOut(c.g, [id]);
        // ruling 8: não volta na etapa de desvirar do controlador; fica presa a esta Oubliette
        for (const x of comAnexos(c.g, id)) if (s.objects[x].phasedOut) s.objects[x].data.phaseOutUntil = c.source;
        o.linked[CHAVE] = [id];
        c.g.bump();
      }, {
        targets: [t.creature()],
        text: 'Quando este encantamento entra, a criatura alvo sai de fase até este encantamento sair do campo. Vire essa criatura quando ela entrar em fase assim. (Auras e Equipamentos saem de fase com ela. Enquanto estão fora de fase, as permanentes são tratadas como se não existissem.)',
      }),
      // CR 610.3: logo depois de Oubliette sair do campo, a criatura entra em fase, virada
      triggered(on.selfLeaves(), function* (c) {
        const s = c.g.state;
        const presas = (lkiObj(c.g, c.source)?.linked[CHAVE] ?? []).filter((id) => s.objects[id]?.zone === 'battlefield' && s.objects[id].phasedOut && s.objects[id].data.phaseOutUntil === c.source);
        const voltam: ObjId[] = [];
        for (const id of presas) {
          // ruling 6: as Auras e os Equipamentos voltam com ela, ainda anexados, e os marcadores continuam
          for (const x of comAnexos(c.g, id)) {
            const o = s.objects[x];
            if (!o.phasedOut) continue;
            o.phasedOut = false;
            delete o.data.phasedOutBy;
            delete o.data.phaseOutUntil;
            voltam.push(x);
          }
          // ruling 9: ela entra em fase já virada; não é "ser virada" e não dispara nada
          s.objects[id].tapped = true;
        }
        if (voltam.length) { c.g.bump(); emit(c.g, voltam.map((obj) => ({ type: 'phaseIn' as const, obj }))); }
      }, { text: 'Quando este encantamento sai do campo, a criatura que saiu de fase com ele entra em fase, virada.' }),
    ],
  }],
  rulings: {
    1: 'teste: se Oubliette sai do campo antes de o gatilho resolver, a criatura não sai de fase',
    2: 'teste: a criatura fora de fase não pode ser alvo nem atacar, e as Auras saem de fase com ela',
    3: 'regra geral: CR 702.26d — sair e entrar em fase não é mudar de zona: nada de "entra" ou "sai do campo" dispara (motor/mecanicas.ts phaseOut)',
    4: 'regra geral: CR 702.26d — efeitos "até sair do campo" não acabam quando a permanente sai de fase (não há mudança de zona)',
    5: 'regra geral: CR 702.26f — efeitos "enquanto" ignoram o que está fora de fase (motor/chars.ts)',
    6: 'teste: saindo Oubliette, a criatura entra em fase virada, com as Auras e os marcadores',
    7: 'regra geral: CR 702.26d — a permanente é a mesma: as escolhas feitas ao entrar continuam (objeto.choices)',
    8: 'teste: a criatura fora de fase não volta na etapa de desvirar do controlador',
    9: 'regra geral: CR 702.26c — ela entra em fase já virada; o motor não emite o evento de virar (cartas/defs/oubliette.ts)',
  },
});
