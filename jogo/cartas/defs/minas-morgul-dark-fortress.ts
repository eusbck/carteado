// Minas Morgul, Dark Fortress
// Minas Morgul enters tapped.
// {T}: Add {B}.
// {3}{B}, {T}: Put a shadow counter on target creature. For as long as that creature has a shadow counter on it, it's a
// Wraith in addition to its other types. (A creature with shadow can block or be blocked by only creatures with shadow.)
import { activated, addCounters, addEffect, defineCard, land, mana, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Minas Morgul, Dark Fortress',
  faces: [{
    abilities: [
      land.tapped(),
      mana('B'),
      activated('{3}{B}, {T}', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // ruling 2: o marcador de sombra dá sombra (CR 122.1b)
        addCounters(c.g, { kind: 'obj', id }, 'shadow', 1, c.you);
        // Simplificação: é Wraith enquanto continuar no campo (não confere se o marcador saiu depois)
        if ((c.g.state.objects[id]?.counters.shadow ?? 0) > 0) addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: id }, affected: [id], mods: [{ k: 'addTypes', subtypes: ['Wraith'] }] });
      }, { targets: [t.creature()], text: '{3}{B}, {T}: Coloque um marcador de sombra na criatura alvo. Enquanto essa criatura tiver um marcador de sombra, ela é um Wraith além dos outros tipos dela.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 509.1h — a criatura já bloqueada continua bloqueada mesmo ganhando ou perdendo sombra (motor/combat.ts)',
    2: 'teste: {3}{B}, {T}: a criatura alvo ganha um marcador de sombra, passa a ter sombra e vira Wraith',
    3: 'regra geral: CR 702.28c — várias instâncias de sombra são redundantes (motor/chars.ts)',
    4: 'regra geral: CR 509.1b — com mais de uma evasão, a bloqueadora precisa satisfazer todas (motor/combat.ts canBlock)',
  },
});