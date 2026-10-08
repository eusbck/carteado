"""Gera índices e páginas offline usando apenas a biblioteca padrão do Python."""
from pathlib import Path
import hashlib
import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'dados'
DATA.mkdir(exist_ok=True)
VERSION = '2026-09-25'
ACCESSED = '2026-10-03'
OFFICIAL = ROOT / 'fontes-oficiais' / 'MagicCompRules-2026-09-25.txt'
raw = OFFICIAL.read_text(encoding='utf-8')
lines = raw.splitlines()
assert len(lines) == 8017, f'Cobertura inesperada: {len(lines)} linhas'
assert 'effective as of September 25, 2026' in raw
start = [i for i, line in enumerate(lines) if line == '1. Game Concepts'][-1]
glossary_at = [i for i, line in enumerate(lines) if line == 'Glossary'][-1]
credits_at = [i for i, line in enumerate(lines) if line == 'Credits'][-1]
rules = []
current = None
for i in range(start + 1, glossary_at):
    line = lines[i]
    match = re.match(r'^(\d{3}(?:\.\d+[a-z]?)?)(?:\.?(?:\s+|$))(.*)$', line)
    if match:
        current = {'id': match[1], 'section': match[1].split('.')[0], 'text': match[2], 'line': i + 1}
        rules.append(current)
    elif current is not None and line and not re.match(r'^[1-9]\. ', line):
        current['text'] += '\n' + line
ids = [r['id'] for r in rules]
assert len(ids) == len(set(ids)), 'Regra duplicada no índice'
for required in ['101.1', '117.4', '305.1', '510.2', '514.3a', '605.1a', '701.6', '702.124', '800.4j', '903.9a', '905']:
    assert required in ids, f'Regra ausente: {required}'

glossary = []
current = None
for i in range(glossary_at + 1, credits_at):
    line = lines[i]
    if not line:
        continue
    is_term = (len(line) < 130 and not re.search(r'[.!?]', line) and not line.endswith((':', ';', ',', '—'))
               and not line.startswith(('See ', 'Example:')) and i + 1 < credits_at and bool(lines[i + 1]))
    if is_term:
        current = {'term': line, 'text': '', 'line': i + 1}
        glossary.append(current)
    elif current is not None:
        current['text'] += ('\n' if current['text'] else '') + line
assert any(g['term'] == 'First Strike' for g in glossary)
assert any(g['term'] == 'Commander' for g in glossary)
assert all(g['text'] for g in glossary), [(g['term'], g['line']) for g in glossary if not g['text']]
mechanics = [{'id': r['id'], 'name': r['text'].split('\n')[0], 'kind': 'action' if r['section'] == '701' else 'ability'}
            for r in rules if re.fullmatch(r'70[12]\.\d+', r['id'])]

topic_rows = [
    ('Prioridade', ['prioridade', 'responder', 'resposta', 'priority', 'timing'], ['117', '116']),
    ('Pilha', ['pilha', 'stack', 'resolucao', 'resolver'], ['405', '608', '117']),
    ('Turnos', ['turno', 'turnos', 'fases', 'etapas', 'passar turno'], ['500', '501', '502', '503', '504', '505', '506', '507', '508', '509', '510', '511', '512', '513', '514']),
    ('Comandante', ['comandante', 'commander', 'commander damage', 'taxa', 'dano de comandante'], ['903', '702.124']),
    ('Terrenos', ['terreno', 'terrenos', 'land'], ['305']),
    ('Mana e custos', ['mana', 'custo', 'custos'], ['106', '107', '118', '601', '605']),
    ('Combate', ['combate', 'ataque', 'atacar', 'bloquear', 'bloqueio', 'combat'], ['506', '507', '508', '509', '510', '511', '802']),
    ('Tipos de carta', ['tipos', 'cartas', 'tipos de cartas', 'tipos de carta'], ['205', '300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315']),
    ('Habilidades', ['habilidade', 'habilidades', 'gatilhos', 'gatilho', 'etb'], ['113', '602', '603', '604', '605', '606']),
    ('Alvos', ['alvo', 'alvos', 'target'], ['115', '608.2b']),
    ('Ações de estado', ['acao de estado', 'acoes de estado', 'sba', 'morte', 'morrer', 'derrota'], ['704', '104', '903.9']),
    ('Multiplayer', ['multiplayer', 'multijogador', 'sair do jogo', 'eliminacao'], ['800', '806', '802']),
    ('Mulligan', ['mulligan', 'mao inicial'], ['103.5']),
    ('Zonas', ['zona', 'zonas', 'exilio', 'cemiterio', 'grimorio', 'mao'], ['400', '401', '402', '403', '404', '405', '406', '408']),
    ('Limpeza', ['limpeza', 'fim do turno', 'etapa final', 'final do turno'], ['513', '514']),
    ('Anulação', ['anulacao', 'anular', 'counterspell'], ['701.6', '608.2b']),
    ('Camadas e cópias', ['camadas', 'copias', 'copia', 'layers', 'copy'], ['613', '707']),
    ('Substituição', ['substituicao', 'prevencao', 'replacement'], ['614', '615', '616']),
    ('Lealdade', ['lealdade', 'planeswalker'], ['306', '606']),
    ('Indestrutível', ['indestrutivel'], ['702.12', '704.5f', '704.5g', '704.5h']),
    ('Voar e alcance', ['voar', 'voo', 'alcance'], ['702.9', '702.17']),
    ('Atropelar', ['atropelar'], ['702.19', '510.1c']),
    ('Proteção e ward', ['protecao', 'salvaguarda', 'resistencia a magia', 'manto'], ['702.16', '702.21', '702.11', '702.18']),
    ('Vínculo com a vida', ['vinculo com a vida', 'lifelink'], ['702.15', '120']),
    ('Veneno', ['veneno', 'infectar', 'toxico'], ['104.3d', '702.90', '702.164']),
    ('Monarca e iniciativa', ['monarca', 'iniciativa', 'undercity'], ['725', '726', '702.7']),
    ('Goad', ['incitar', 'goad'], ['701.15', '508.1']),
    ('Veículos e Espaçonaves', ['veiculo', 'veiculos', 'espaconave', 'tripular', 'station', 'crew'], ['301', '702.122', '702.184', '721', '903.3']),
    ('Palavras-chave', ['mecanica', 'mecanicas', 'palavras-chave', 'keywords'], ['701', '702']),
    ('Atalhos e loops', ['atalho', 'atalhos', 'loop', 'loops', 'infinito'], ['732', '104.4b']),
    ('Cartas de duas faces', ['duas faces', 'transformar', 'adventure', 'aventura'], ['709', '710', '712', '715']),
    ('Fichas', ['ficha', 'fichas', 'tesouro', 'pista', 'comida', 'sangue'], ['111']),
]
topics = [{'label': label, 'aliases': aliases, 'refs': refs} for label, aliases, refs in topic_rows]

# Situações originais. Nenhum exemplo pressupõe uma carta real não especificada.
cases = [
    ('Prioridade', 'É a principal de Ana. Ela conjura uma mágica. Quem recebe prioridade ao terminar a conjuração?', ['Bruno automaticamente', 'Ana, que acabou de conjurar', 'Ninguém até resolver'], 1, 'Quem conjurou com prioridade recebe prioridade novamente e pode mantê-la para outra ação legal.', ['117.3c']),
    ('Prioridade', 'Há três objetos na pilha e todos passam consecutivamente. O que resolve?', ['Toda a pilha', 'Apenas o objeto do topo', 'O objeto mais antigo'], 1, 'Resolve só o topo. Depois há ações de estado, gatilhos e prioridade do ativo.', ['117.4', '117.5']),
    ('Prioridade', 'Você passou. Carla colocou uma resposta na pilha. Quando a prioridade voltar, você pode agir?', ['Sim, houve uma ação nova', 'Não, seu passe vale até acabar a pilha', 'Só no seu turno'], 0, 'A ação nova interrompe a sequência de passes. Passar uma vez não impede respostas futuras.', ['117.4']),
    ('Prioridade', 'Quem recebe prioridade depois que resolve uma mágica de Bruno no turno de Ana?', ['Bruno', 'Ana, após as verificações pertinentes', 'Quem estava sentado depois de Bruno'], 1, 'O ativo recebe prioridade após a resolução de uma mágica/habilidade que não seja de mana.', ['117.3b']),
    ('Prioridade', 'Todos passam com a pilha vazia durante uma principal. O que acontece?', ['O turno inteiro acaba', 'A fase atual termina e o jogo segue a estrutura do turno', 'O ativo precisa jogar uma carta'], 1, 'Pilha vazia e passes consecutivos encerram a etapa/fase, não necessariamente o turno.', ['117.4', '500']),
    ('Prioridade', 'Uma mágica está resolvendo e manda comprar duas cartas. Posso conjurar entre as compras?', ['Normalmente não', 'Sim, sempre', 'Só se tenho mana'], 0, 'Não há prioridade durante a resolução; compras separadas não são janelas de resposta.', ['117.2e', '121.2']),
    ('Turnos', 'Posso responder a uma permanente desvirando na etapa de desvirar?', ['Sim', 'Não; ninguém tem prioridade nessa etapa', 'Só com flash'], 1, 'A etapa de desvirar não dá prioridade. A janela normal seguinte é a manutenção.', ['117.3a', '502']),
    ('Turnos', 'Quero agir antes da compra normal do turno adversário. Qual janela usar?', ['Manutenção', 'Depois que ele compra na etapa de compra', 'Durante o pagamento da compra'], 0, 'A compra normal da etapa acontece antes da prioridade. Na manutenção ainda pode agir antes dela.', ['503', '504.1']),
    ('Turnos', 'Na etapa final, uma criatura ainda tem dano marcado do combate?', ['Normalmente sim; a limpeza vem depois', 'Não; a etapa final já limpou tudo', 'Só se é comandante'], 0, 'O dano é removido na limpeza, não automaticamente no início da etapa final.', ['514.2', '513']),
    ('Turnos', 'Descartar na limpeza disparou uma habilidade. Há oportunidade de responder?', ['Não, nunca há prioridade na limpeza', 'Sim, aplica-se a exceção; haverá outra limpeza depois', 'O gatilho espera a manutenção seguinte'], 1, 'CR 514.3a abre prioridade nesse caso e determina outra limpeza após esvaziar a pilha e os passes.', ['514.3a']),
    ('Terrenos e mana', 'Posso jogar meu terreno no turno de Carla só porque tenho prioridade?', ['Sim', 'Não pela regra normal', 'Sim se ele produz mana'], 1, 'Terreno exige seu turno, sua principal, pilha vazia e jogada disponível.', ['305.1', '305.3']),
    ('Terrenos e mana', 'Joguei um terreno na principal 1. A principal 2 permite outro automaticamente?', ['Sim', 'Não; o limite é do turno inteiro', 'Só se passei prioridade'], 1, 'As duas principais compartilham o mesmo limite do turno; permissões adicionais são outra questão.', ['305.2']),
    ('Terrenos e mana', 'Posso anular o terreno que foi jogado como se fosse uma mágica?', ['Não: a jogada não usa pilha', 'Sim, qualquer anulação', 'Só terrenos não básicos'], 0, 'Jogar terreno é ação especial. Eventuais gatilhos da entrada são objetos distintos.', ['305.1', '116.2a']),
    ('Terrenos e mana', 'Passar prioridade esvazia a mana não usada?', ['Sim', 'Não; em regra ela se perde ao fim de etapa/fase', 'Só mana colorida'], 1, 'Passar prioridade não muda por si só a etapa/fase e não esvazia a reserva.', ['106.4']),
    ('Terrenos e mana', 'O que exige um símbolo {C} em um custo?', ['Qualquer mana', 'Mana incolor', 'Mana da identidade do comandante'], 1, '{C} exige incolor; um número genérico como {1} pode ser pago com mana de qualquer tipo.', ['107.4']),
    ('Terrenos e mana', 'Uma ativada adiciona mana, mas também mói carta como custo. É habilidade de mana na regra atual?', ['Sim, toda produtora de mana é', 'Não satisfaz o critério atual por mover carta do grimório', 'Só se não tenho cartas'], 1, 'CR 605.1a também exige que custo e efeito não movam cartas para ou de grimório.', ['605.1a']),
    ('Custos e habilidades', 'Sacrifico uma criatura como custo de ativação. O oponente pode removê-la depois para impedir esse pagamento?', ['Não; o custo já foi pago antes da resposta', 'Sim, os custos ficam na pilha', 'Sim, se tem prioridade depois'], 0, 'A janela de resposta surge depois do processo de ativação e pagamento. A criatura já saiu.', ['602.2', '118']),
    ('Custos e habilidades', 'Uma anulação removeu minha mágica da pilha. Recebo de volta a mana e o custo adicional?', ['Sim', 'Não', 'Só a taxa de comandante'], 1, 'Anular não desfaz custos que foram legalmente pagos.', ['118', '601.2h', '701.6']),
    ('Custos e habilidades', 'Removi a criatura que era fonte de uma habilidade já ativada na pilha. A habilidade é anulada automaticamente?', ['Não, normalmente tem existência independente', 'Sim, sempre', 'Só se era meu comandante'], 0, 'A habilidade normalmente permanece; o texto pode impor condições específicas e usar última informação conhecida.', ['113.7a', '608.2h']),
    ('Custos e habilidades', 'Na minha principal, há um gatilho na pilha. Posso ativar lealdade pela regra normal?', ['Sim, porque é minha principal', 'Não; também precisa da pilha vazia', 'Só se o planeswalker acabou de entrar'], 1, 'Lealdade tem timing próprio, incluindo pilha vazia e limite por permanente por turno.', ['606.3']),
    ('Alvos e permanentes', 'O único alvo de minha mágica ficou ilegal antes da resolução. O efeito de comprar que também estava nela ocorre?', ['Sim, sempre', 'Não; a mágica não resolve', 'Posso escolher outro alvo livremente'], 1, 'Quando todos os alvos ficam ilegais, o objeto não resolve e seus demais efeitos não acontecem.', ['608.2b']),
    ('Alvos e permanentes', 'Minha mágica tem dois alvos; um ainda é legal. Qual a regra geral?', ['Não resolve nada', 'Resolve o que puder sem afetar o alvo ilegal', 'O alvo ilegal é substituído por outro'], 1, 'Pelo menos um alvo legal normalmente permite resolver as instruções aplicáveis.', ['608.2b']),
    ('Alvos e permanentes', 'Hexproof por si só impede uma destruição global que não visa?', ['Sim', 'Não', 'Só se é lendária'], 1, 'Hexproof impede alvos pertinentes, não todos os efeitos que afetam a permanente.', ['702.11', '115']),
    ('Alvos e permanentes', 'Indestrutível salva uma criatura que ficou com resistência zero?', ['Sim', 'Não; isso não é destruição', 'Só se recebeu dano antes'], 1, 'A ação de estado por resistência zero manda ao cemitério sem destruir.', ['704.5f', '702.12']),
    ('Alvos e permanentes', 'Ana e Bruno controlam cada um uma lendária do mesmo nome. A regra de lendas elimina uma?', ['Sim', 'Não só por isso; precisa do mesmo controlador', 'Só a que entrou depois'], 1, 'A regra considera duas ou mais lendárias do mesmo nome sob controle do mesmo jogador.', ['704.5j']),
    ('Combate', 'Minha criatura entrou agora. Pode bloquear uma atacante legal?', ['Sim, se estiver apta ao bloqueio', 'Não, está com enjoo', 'Só se tiver haste'], 0, 'Enjoo restringe atacar e os símbolos de virar/desvirar de criaturas; não é uma proibição de bloqueio.', ['302.6', '509']),
    ('Combate', 'A atacante foi bloqueada e depois o único bloqueador saiu. Sem atropelar, ela acerta o jogador?', ['Sim', 'Normalmente não; continua bloqueada', 'Só com golpe duplo'], 1, 'A atacante continua bloqueada e normalmente não atribui dano ao jogador sem exceção pertinente.', ['509.1h', '510.1c']),
    ('Combate', 'Posso agir entre a atribuição e a aplicação do dano de combate?', ['Não', 'Sim, o dano fica na pilha', 'Só com instantânea'], 0, 'Ambas são ações automáticas sem essa janela intermediária.', ['510.2']),
    ('Combate', 'Uma atacante é bloqueada por duas criaturas. Na regra atual, é obrigatório ordenar os bloqueadores para atribuição comum?', ['Sim', 'Não; o dano pode ser dividido como o controlador escolher', 'Só se são lendárias'], 1, 'A antiga ordem foi removida. Atropelar ainda tem exigência particular de letal antes de passar dano ao destinatário.', ['510.1c', '702.19b']),
    ('Combate', 'Há iniciativa ou golpe duplo elegível. Pode haver respostas entre as etapas de dano?', ['Sim, após o primeiro dano e verificações', 'Não, todo o combate é simultâneo', 'Só o defensor responde'], 0, 'Há prioridade após a primeira etapa antes de a segunda começar.', ['510.4', '117']),
    ('Combate', 'Virei a bloqueadora depois de ela ser declarada. O bloqueio é cancelado?', ['Sim', 'Não por esse motivo', 'Sim, se ela não tem vigilância'], 1, 'Virar/desvirar depois da declaração não remove automaticamente do combate.', ['506.4b']),
    ('Combate', 'Uma criatura foi colocada no campo já atacando. Ela foi declarada atacante para seu gatilho de atacar?', ['Normalmente não', 'Sim', 'Só em multiplayer'], 0, 'Entrar atacando e ser declarada atacante são eventos diferentes.', ['508.4']),
    ('Commander', 'Meu comandante foi anulado após ser conjurado da zona de comando. A próxima conjuração de lá paga taxa maior?', ['Sim', 'Não, ele não chegou ao campo', 'Só se morreu depois'], 0, 'A taxa conta conjurações anteriores da zona de comando, incluindo as anuladas.', ['903.8']),
    ('Commander', 'Reanimei meu comandante do cemitério sem conjurar. Isso acrescenta uma conjuração para a taxa?', ['Não', 'Sim, entrou de novo', 'Só se é lendário'], 0, 'Pôr no campo sem conjurar não é conjuração da zona de comando.', ['903.8']),
    ('Commander', 'O comandante morreu. Pela opção usual, ele deixa de chegar ao cemitério?', ['Sim', 'Não; chega e o dono pode movê-lo por ação de estado', 'Só se tinha indestrutível'], 1, 'O retorno usual de cemitério/exílio ocorre na verificação de estado, permitindo o evento de morrer pertinente.', ['903.9a']),
    ('Commander', 'Deixei meu comandante no cemitério na verificação pertinente. Posso movê-lo à zona de comando quando quiser?', ['Não por aquela mesma mudança antiga', 'Sim, sempre', 'Sim, pagando dois'], 0, 'A opção depende de ter entrado na zona desde a última verificação. Não é uma ativação permanente disponível.', ['903.9a']),
    ('Commander', 'Uma cópia de meu comandante é automaticamente comandante?', ['Não', 'Sim', 'Só se tem o mesmo nome'], 0, 'A designação é atributo da carta e não um valor copiável. O comandante real continua comandante ao copiar outra carta.', ['903.3']),
    ('Commander', 'Recebi 12 de combate de um parceiro e 9 do outro. Isso soma 21 do mesmo comandante?', ['Sim', 'Não; os danos das duas cartas são separados', 'Só se controlados pela mesma pessoa'], 1, 'Cada comandante tem seu próprio total contra cada jogador.', ['702.124d', '903.10a']),
    ('Commander', 'Um comandante me causou 7 de dano por uma habilidade. Isso entra no total de 21?', ['Não; precisa ser dano de combate', 'Sim, porque veio do comandante', 'Só se perdi vida'], 0, 'Dano de habilidade e de briga não são dano de combate.', ['903.10a', '701.14']),
    ('Commander', 'Ganhei vida depois de receber dano de comandante. O total de comandante diminui?', ['Não', 'Sim, pelo mesmo valor', 'Só se ganho até 40'], 0, 'Vida e histórico de dano de combate por comandante são rastreados separadamente.', ['903.10a']),
    ('Commander', 'Uma carta tem mana híbrida branca/verde. Pode entrar em um comandante só verde por eu pagar verde?', ['Normalmente não', 'Sim', 'Só se não a conjuro'], 0, 'A identidade inclui ambas as cores híbridas. Texto de lembrete é uma exceção de cálculo diferente.', ['903.4', '903.5c']),
    ('Multiplayer e derrota', 'A partida começou com quatro jogadores. Ana, a primeira, compra no primeiro turno?', ['Sim', 'Não', 'Só se pediu mulligan'], 0, 'Em multiplayer sem a exceção de turnos de equipe, ninguém pula essa compra inicial.', ['103.8c']),
    ('Multiplayer e derrota', 'A partida começou com apenas dois jogadores em Commander padrão. Quem começa compra no primeiro turno?', ['Não; pula a etapa de compra inicial', 'Sim, Commander sempre compra', 'Só se o grupo está no bracket 3'], 0, 'A regra de duas pessoas é diferente da regra de multiplayer; não confunda com Duel Commander.', ['103.8a', '903.2']),
    ('Multiplayer e derrota', 'Commander normalmente exige quantos marcadores de veneno para perder?', ['10', '20', '40'], 0, 'O início com 40 de vida não altera o limite normal de dez marcadores de veneno.', ['104.3d']),
    ('Multiplayer e derrota', 'Meu grimório está vazio, mas ainda não tentei comprar de lá. Isso sozinho me faz perder?', ['Não', 'Sim', 'Só no meu turno'], 0, 'A condição normal de derrota exige uma tentativa de compra que não pôde ser cumprida.', ['104.3c', '121']),
    ('Multiplayer e derrota', 'Bruno sai do jogo enquanto Carla controla uma carta de propriedade dele. O objeto permanece só porque Carla controla?', ['Não; os objetos dele deixam o jogo', 'Sim', 'Vira propriedade de Carla'], 0, 'Propriedade e controle são diferentes. Os objetos do jogador que sai deixam o jogo.', ['800.4a']),
    ('Multiplayer e derrota', 'Bruno perde durante seu próprio turno. Esse turno acaba imediatamente?', ['Não; continua até concluir sem jogador ativo', 'Sim', 'Volta ao começo de Ana'], 0, 'A regra multiplayer define continuidade e prioridade especial para o restante desse turno.', ['800.4j']),
    ('Gatilhos e exceções', 'Gatilhos de todos dispararam juntos no turno de Ana. Em geral, como entram na pilha?', ['Ativo põe os seus; outros põem os seus na ordem do turno', 'Todos resolvem sem pilha', 'O mais rápido a falar escolhe'], 0, 'APNAP organiza a colocação, e cada jogador ordena os próprios gatilhos. Os últimos colocados ficam no topo.', ['603.3b', '101.4']),
    ('Gatilhos e exceções', 'Uma criatura com lifelink causa dano enquanto eu recebo dano simultâneo. O ganho de vida espera um gatilho na pilha?', ['Não; faz parte do resultado do dano', 'Sim', 'Só se é comandante'], 0, 'Lifelink é habilidade estática que modifica os resultados do dano, não o antigo gatilho de ganho posterior.', ['702.15', '120']),
    ('Gatilhos e exceções', 'Um efeito exila e devolve meu comandante durante a mesma resolução. A opção usual por exílio permite interromper a resolução?', ['Não; a verificação de estado espera a resolução terminar', 'Sim, escolho no meio e todos respondem', 'Sim, pagando a taxa'], 0, 'Se ele já voltou antes da verificação, não está no exílio para aquela ação de estado. Uma volta por gatilho posterior é diferente.', ['903.9a', '117.5', '704']),
    ('Gatilhos e exceções', 'Uma criatura com enjoo pode ser virada para pagar crew de um Veículo?', ['Sim, se é uma criatura desvirada apropriada', 'Não, crew exige haste', 'Só se é artefato'], 0, 'Crew não usa o símbolo de virar de uma habilidade da própria criatura usada no custo.', ['702.122', '302.6']),
]
scenarios = [{'id': f'Q{i:02}', 'topic': row[0], 'question': row[1], 'options': row[2], 'answer': row[3],
              'explanation': row[4], 'rules': row[5]} for i, row in enumerate(cases, 1)]
for s in scenarios:
    assert 0 <= s['answer'] < len(s['options'])
    assert all(ref in ids for ref in s['rules']), s

banned_names = ['Ancestral Recall', 'Balance', 'Black Lotus', 'Chaos Orb', 'Channel', 'Dockside Extortionist', 'Emrakul, the Aeons Torn', 'Erayo, Soratami Ascendant', 'Falling Star', 'Fastbond', 'Flash', 'Golos, Tireless Pilgrim', 'Griselbrand', 'Hullbreacher', 'Iona, Shield of Emeria', 'Karakas', 'Jeweled Lotus', 'Leovold, Emissary of Trest', 'Library of Alexandria', 'Limited Resources', 'Mana Crypt', 'Mox Emerald', 'Mox Jet', 'Mox Pearl', 'Mox Ruby', 'Mox Sapphire', 'Nadu, Winged Wisdom', 'Paradox Engine', 'Primeval Titan', 'Prophet of Kruphix', 'Recurring Nightmare', 'Rofellos, Llanowar Emissary', 'Shahrazad', 'Sundering Titan', 'Sylvan Primordial', 'Time Vault', 'Time Walk', 'Tinker', 'Tolarian Academy', 'Trade Secrets', 'Upheaval', "Yawgmoth's Bargain"]
bans = {'accessed_on': ACCESSED, 'source': 'https://magic.wizards.com/en/banned-restricted-list',
        'banned_by_name': banned_names, 'banned_as_companion_only': ['Lutri, the Spellchaser'],
        'banned_categories': ['Conspiracy cards', 'Cards that refer to playing for ante', 'Cards banned in all formats for racially or culturally offensive content'],
        'explicitly_unbanned_2026_02_09': ['Biorhythm', 'Lutri, the Spellchaser (deck/commander only)'],
        'notes': 'Não é um validador completo: identidade, singleton, elegibilidade, acorn/playtest, nomes intercambiáveis e demais regras também precisam de validação.'}

source_rows = [
    ('cr', 'Comprehensive Rules 25/09/2026 — TXT', 'https://media.wizards.com/2026/downloads/MagicCompRules%2020260925.txt', 'fontes-oficiais/MagicCompRules-2026-09-25.txt'),
    ('cr-pdf', 'Comprehensive Rules 25/09/2026 — PDF, 312 páginas', 'https://media.wizards.com/2026/downloads/MagicCompRules%2020260925.pdf', None),
    ('rules', 'Central de regras', 'https://magic.wizards.com/en/rules', None),
    ('commander', 'Página atual do formato Commander', 'https://magic.wizards.com/en/formats/commander', None),
    ('bans', 'Lista atual de banidas por formato', 'https://magic.wizards.com/en/banned-restricted-list', 'dados/banidas-commander.json'),
    ('basics-pt', 'Como jogar — português', 'https://magic.wizards.com/pt-BR/how-to-play', None),
    ('keywords-pt', 'Palavras-chave comuns — português', 'https://magic.wizards.com/pt-BR/keyword-glossary', None),
    ('oracle', 'Gatherer — consultar Oracle e rulings por carta', 'https://gatherer.wizards.com/', None),
    ('wpn', 'Documentos de regras e política de eventos', 'https://wpn.wizards.com/en/rules-documents', None),
    ('mtr', 'Tournament Rules — documento disponibilizado pela WPN', 'https://media.wizards.com/ContentResources/WPN/MTG_MTR_2026_Feb27_EN.pdf', None),
    ('bans-update', 'Mudanças de banidas — 09/02/2026', 'https://magic.wizards.com/en/news/announcements/commander-banned-and-restricted-february-9-2026', None),
    ('brackets-update', 'Brackets — 09/02/2026', 'https://magic.wizards.com/en/news/announcements/commander-brackets-beta-update-february-9-2026', None),
    ('brackets-definitions', 'Definições de brackets — 21/10/2025', 'https://magic.wizards.com/en/news/announcements/commander-brackets-beta-update-october-21-2025', None),
    ('vehicles-update', 'Edge of Eternities — mudanças de comandante', 'https://magic.wizards.com/en/news/announcements/edge-of-eternities-update-bulletin', None),
    ('latest-update', 'Reality Fracture — boletim de regras', 'https://magic.wizards.com/en/news/announcements/reality-fracture-update-bulletin', None),
]
sources = [{'id': sid, 'title': title, 'url': url, 'accessed_on': ACCESSED, 'local_snapshot': local,
            'status': 'referência de consulta por carta; não copiada' if sid == 'oracle' else 'consultada online',
            'publisher': 'Wizards of the Coast'} for sid, title, url, local in source_rows]
future_state = {'schema_version': 1, 'rules_version': VERSION, 'purpose': 'Modelo para uma futura simulação de decks, além do motor didático',
    'format': 'Commander', 'initial_player_count': 4, 'turn_order': ['A', 'B', 'C', 'D'], 'active_player': 'A', 'priority_holder': 'A',
    'turn': {'number': 1, 'phase': 'beginning', 'step': 'upkeep', 'consecutive_passes': 0, 'extra_turns': []},
    'players': [{'id': x, 'life': 40, 'poison': 0, 'decklist': None, 'commander_card_ids': [], 'mana_pool': [], 'land_plays_used': 0, 'max_hand_size': 7} for x in ['A', 'B', 'C', 'D']],
    'objects': [], 'stack': [], 'pending_triggers': [], 'continuous_effects': [], 'replacement_effects': [],
    'commander_casts_from_command_zone': {}, 'commander_combat_damage_to_players': {}, 'event_log': [],
    'missing_inputs': ['Comandantes da mesa', 'Listas completas dos decks', 'Rule 0 combinado', 'Texto Oracle e implementação das cartas']}

def write_json(name, value):
    (DATA / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

write_json('regras-completas.json', rules)
write_json('glossario-oficial.json', glossary)
write_json('indice-mecanicas.json', mechanics)
write_json('indice-assuntos.json', topics)
write_json('cenarios.json', scenarios)
write_json('banidas-commander.json', bans)
write_json('fontes.json', sources)
write_json('estado-partida-exemplo.json', future_state)
manifest = {'accessed_on': ACCESSED, 'rules_effective_on': VERSION, 'publisher': 'Wizards of the Coast',
    'source_url': sources[0]['url'], 'source_extraction': 'Todas as linhas numeradas expostas pela leitura web do TXT oficial; quebras normalizadas',
    'source_line_count': len(lines), 'source_line_gaps': [], 'local_sha256': hashlib.sha256(OFFICIAL.read_bytes()).hexdigest(),
    'local_sha256_is_original_download_hash': False, 'indexed_rule_entries': len(rules), 'glossary_entries': len(glossary),
    'keyword_subsections': len(mechanics), 'practice_scenarios': len(scenarios), 'named_bans': len(banned_names),
    'simulator_scope': ['priority', 'stack_top_resolution', 'normal_timing', 'land_limit', 'loyalty_limit', 'turn_step_windows', 'initial_draw_skip', 'cleanup_trigger_example'],
    'simulator_not_implemented': ['real_decks', 'card_oracle_execution', 'combat_damage_calculation', 'mana_payment', 'layers', 'arbitrary_replacement_effects', 'defeat_and_elimination'],
    'official_card_rulings_copied': False, 'original_pdf_downloaded': False}
write_json('manifesto.json', manifest)
payload = {'version': VERSION, 'accessedOn': ACCESSED, 'rules': rules, 'glossary': glossary, 'topics': topics, 'scenarios': scenarios, 'sources': sources}
(ROOT / 'simulador' / 'dados.js').write_text('window.MTG_DATA = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + ';\n', encoding='utf-8')

def inline(text):
    text = html.escape(text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
    return text

toc = []
def render_markdown(text, doc_id):
    out = []
    source_lines = text.splitlines()
    i = 0
    list_kind = None
    while i < len(source_lines):
        line = source_lines[i]
        if not line.strip():
            if list_kind: out.append('</' + list_kind + '>'); list_kind = None
            i += 1; continue
        heading = re.match(r'^(#{1,6}) (.*)$', line)
        if heading:
            if list_kind: out.append('</' + list_kind + '>'); list_kind = None
            level = len(heading[1]); anchor = doc_id + '-' + str(i)
            toc.append((level, heading[2], anchor))
            out.append(f'<h{level} id="{anchor}">{inline(heading[2])}</h{level}>')
            i += 1; continue
        if line.startswith('|'):
            if list_kind: out.append('</' + list_kind + '>'); list_kind = None
            rows = []
            while i < len(source_lines) and source_lines[i].startswith('|'):
                cells = [cell.strip() for cell in source_lines[i].strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', cell) for cell in cells): rows.append(cells)
                i += 1
            out.append('<div class="table-wrap"><table><thead><tr>' + ''.join('<th>' + inline(cell) + '</th>' for cell in rows[0]) + '</tr></thead><tbody>')
            for row in rows[1:]: out.append('<tr>' + ''.join('<td>' + inline(cell) + '</td>' for cell in row) + '</tr>')
            out.append('</tbody></table></div>'); continue
        item = re.match(r'^(?:- |\d+\. )(.*)$', line)
        if item:
            kind = 'ul' if line.startswith('- ') else 'ol'
            if list_kind != kind:
                if list_kind: out.append('</' + list_kind + '>')
                out.append('<' + kind + '>'); list_kind = kind
            out.append('<li>' + inline(item[1]) + '</li>'); i += 1; continue
        if list_kind: out.append('</' + list_kind + '>'); list_kind = None
        paragraph = [line]; i += 1
        while i < len(source_lines) and source_lines[i].strip() and not re.match(r'^(#|\||- |\d+\. )', source_lines[i]):
            paragraph.append(source_lines[i]); i += 1
        out.append('<p>' + inline(' '.join(paragraph)) + '</p>')
    if list_kind: out.append('</' + list_kind + '>')
    return '\n'.join(out)

style = '''body{max-width:1000px;margin:auto;padding:42px 30px;background:#f7f3eb;color:#252b22;font:16px/1.65 Segoe UI,Arial,sans-serif}h1,h2,h3{font-family:Georgia,serif;font-weight:normal;line-height:1.22;break-after:avoid}h1{font-size:38px;margin:50px 0 24px}h2{font-size:27px;margin:36px 0 16px}h3{font-size:22px}a{color:#355440;text-underline-offset:4px}code{background:#e8e7db;padding:2px 5px;border-radius:3px;font-size:.9em;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;font-size:14px;margin:20px 0}td,th{border:1px solid #d8dbcb;padding:10px 12px;text-align:left;vertical-align:top}th{background:#e7ebde}tr{break-inside:avoid}li{margin:7px 0}.table-wrap{overflow-x:auto}.top{display:flex;justify-content:space-between;gap:15px;font-size:13px;border-bottom:1px solid #d8dbcb;padding-bottom:20px}.doc{border-top:2px solid #c7cdbd;margin-top:50px}nav{background:#eef0e4;padding:24px;border-radius:10px}nav ul{list-style:none;padding:0}nav .sub{font-size:13px;padding-left:18px}button{background:#3e5544;color:white;border:0;padding:9px 14px;border-radius:5px;cursor:pointer}footer{font-size:12px;border-top:1px solid #d8dbcb;margin-top:40px;padding-top:15px}@media(max-width:600px){body{padding:20px 18px;font-size:15px}h1{font-size:31px}.top{flex-wrap:wrap}table{font-size:12px}}@media print{@page{size:A4;margin:18mm}body{background:white;padding:0;font-size:10.5pt;max-width:none}.top,button{display:none}h1{font-size:26pt}h2{font-size:18pt}table{font-size:9pt}.doc{break-before:page;border:0}nav{background:white}a{color:inherit}code{background:#eee}.table-wrap{overflow:visible}p{orphans:3;widows:3}}'''
documents = sorted((ROOT / 'guia').glob('[0-9][0-9]-*.md'))
bodies = []
for doc in documents:
    bodies.append('<article class="doc">' + render_markdown(doc.read_text(encoding='utf-8'), 'doc-' + doc.name[:2]) + '</article>')
contents = '<nav aria-label="Sumário"><h2>Sumário</h2><ul>' + ''.join('<li class="' + ('sub' if level > 1 else '') + '"><a href="#' + anchor + '">' + html.escape(title) + '</a></li>' for level, title, anchor in toc if level <= 2) + '</ul></nav>'
printable = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Guia de Commander — leitura e impressão</title><style>' + style + '</style></head><body><div class="top"><a href="../ABRA-AQUI.html">← Abrir o pacote</a><span>CR 25/09/2026 · pesquisa 03/10/2026</span><button onclick="window.print()">Imprimir / salvar PDF</button></div><h1>Magic: The Gathering<br>Commander para a mesa do fim de semana</h1><p>Guia em português, cola de mesa, perguntas, glossário e roteiros. O manual oficial integral em inglês está salvo e indexado separadamente.</p>' + contents + ''.join(bodies) + '<footer>Fontes: Wizards of the Coast. Exemplos e explicações autorais. Consulte o texto Oracle para interações de cartas particulares.</footer></body></html>'
(ROOT / 'guia' / 'GUIA-PARA-IMPRIMIR.html').write_text(printable, encoding='utf-8')

portal = f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Magic: Commander — comece aqui</title><link rel="stylesheet" href="simulador/estilo.css"><style>.home-grid{{display:grid;grid-template-columns:1fr 1fr;gap:22px}}.home-grid .panel{{margin:0}}.big-link{{display:inline-block;background:#3e5544;color:white;padding:12px 17px;border-radius:6px;text-decoration:none;margin-top:12px}}.stats{{display:flex;gap:26px;flex-wrap:wrap;margin:28px 0 34px}}.stats strong{{display:block;font:32px Georgia,serif}}.stats span{{font-size:12px;color:#687162}}@media(max-width:700px){{.home-grid{{grid-template-columns:1fr}}}}</style></head><body><header class="top"><span class="brand">MAGIC / COMMANDER</span><span>Consulta local · 03.10.2026</span></header><main><div class="intro"><p class="eyebrow">TUDO NA PASTA · FUNCIONA OFFLINE</p><h1>As regras na mão.<br>A mesa sem dúvida.</h1><p>Material pesquisado nas fontes oficiais para entender o Commander, praticar as janelas de ação e consultar suas exceções.</p></div><div class="stats"><div><strong>{len(rules):,}</strong><span>entradas de regras oficiais</span></div><div><strong>{len(glossary)}</strong><span>termos do glossário oficial</span></div><div><strong>{len(scenarios)}</strong><span>situações de treinamento</span></div><div><strong>66</strong><span>perguntas de mesa no guia</span></div></div><div class="home-grid"><article class="panel"><p class="eyebrow">01 / LER E CONSULTAR</p><h2>O guia em português</h2><p>Construção, comandante, cartas, turnos, pilha, combate, custos e pegadinhas. Inclui cola da mesa, glossário e banidas consultadas.</p><a class="big-link" href="guia/GUIA-PARA-IMPRIMIR.html">Ler o guia / imprimir</a></article><article class="panel"><p class="eyebrow">02 / PRATICAR</p><h2>Laboratório de turnos e pilha</h2><p>Veja quem tem prioridade, responda, anule e descubra por que uma ação é recusada. Faça os exercícios com explicação.</p><a class="big-link" href="simulador/index.html">Abrir o laboratório</a></article><article class="panel"><p class="eyebrow">03 / APROFUNDAR</p><h2>Manual oficial integral</h2><p>Comprehensive Rules de 25/09/2026, com todos os capítulos e glossário, em texto local. O laboratório também tem busca por número ou assunto.</p><a href="fontes-oficiais/MagicCompRules-2026-09-25.txt">Abrir o TXT completo</a> · <a href="https://media.wizards.com/2026/downloads/MagicCompRules%2020260925.pdf">PDF oficial online ↗</a></article><article class="panel"><p class="eyebrow">04 / USAR COMO BASE</p><h2>Dados para futuras simulações</h2><p>Regras, mecânicas, cenários, fontes e um estado de partida em JSON. O motor atual é didático; partidas de decks reais precisam das listas e da implementação das cartas.</p><a href="dados/manifesto.json">Ver manifesto e cobertura</a> · <a href="dados/estado-partida-exemplo.json">Estado de exemplo</a></article></div><details class="scope" style="margin-top:28px"><summary>Como usar e o que foi pesquisado</summary><p>Comece pela cola da mesa no guia e pratique prioridade/pilha no laboratório. O guia foi escrito em português; a cobertura integral das regras está no manual em inglês. O PDF oficial, Oracle e documentos externos são links online. O simulador assume custos pagos e não calcula efeitos de cartas individuais, mana detalhada, dano real de combate ou eliminação.</p><p><a href="LEIA-ME.md">Leia-me do pacote</a> · <a href="fontes-oficiais/LEIA-ME.md">Fontes oficiais e versões</a></p></details><footer><p>Referência: Wizards of the Coast. Retrato das regras consultadas em 03/10/2026. Texto Oracle e regras posteriores prevalecem em situações específicas.</p></footer></main></body></html>'''
(ROOT / 'ABRA-AQUI.html').write_text(portal, encoding='utf-8')

# Verifica referências numéricas isoladas nos guias (a pertinência semântica é revisada separadamente).
missing_refs = []
for doc in documents:
    for ref in re.findall(r'(?<!\d)([1-9]\d{2}(?:\.\d+[a-z]?)?)(?![\d/])', doc.read_text(encoding='utf-8')):
        if ref in ['100', '101'] or ref in ids:
            continue
        # Não tratar quantidades, anos nem intervalos de códigos como regra automaticamente.
        if len(ref) > 3 or 100 <= int(ref) <= 905:
            missing_refs.append((doc.name, ref))
print(json.dumps({'rules': len(rules), 'glossary': len(glossary), 'mechanics': len(mechanics),
    'scenarios': len(scenarios), 'official_lines': len(lines), 'official_local_sha256': manifest['local_sha256'],
    'reference_candidates_to_review': sorted(set(missing_refs))}, ensure_ascii=False, indent=2))
