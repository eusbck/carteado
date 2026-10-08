// Eldrazi Conscription
// Enchant creature
// Enchanted creature gets +10/+10 and has trample and annihilator 2.
import { annihilatorGranted, attachedGets, defineCard, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Eldrazi Conscription',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [attachedGets(() => [
      { k: 'pt', p: 10, t: 10 }, { k: 'addKeyword', kw: 'trample' },
      { k: 'addKeyword', kw: 'annihilator', param: 2 }, { k: 'addAbility', id: annihilatorGranted(2) },
    ], 'A criatura encantada recebe +10/+10 e tem atropelar e aniquilador 2.')],
  }],
  rulings: {
    1: 'teste: o defensor sacrifica na declaração de atacantes, antes de bloquear',
    2: 'regra geral: a Aura é Eldrazi, a criatura encantada não',
    3: 'regra geral: CR 506.4 — a atacante continua atacando mesmo sem o planeswalker',
    4: 'regra geral: CR 702.86b — cada instância dispara separadamente',
    5: 'regra geral: CR 205.3c — kindred',
    6: 'regra geral: CR 205.3c — kindred conta como tipo de carta',
    7: 'não se aplica: "tribal" não aparece nos dados',
  },
});
