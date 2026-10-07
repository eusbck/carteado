# Abre a mesa para o grupo: sobe o servidor do jogo com HTTPS e um tunel da Cloudflare que da um endereco
# https:// publico, protegido pela senha de acesso. Feche com Enter (ou fechando a janela).
# Uso: clique duas vezes em "Abrir a mesa.cmd" (ou: powershell -ExecutionPolicy Bypass -File abrir-mesa.ps1)
param(
  [int]$Porta = 8080,
  # so para conferir a instalacao: abre, testa o endereco publico e fecha
  [switch]$Teste
)
$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $raiz
$cache = Join-Path $raiz '.cache'
New-Item -ItemType Directory -Force $cache | Out-Null

# cloudflared: no PATH ou no lugar padrao do instalador
$cf = $null
$cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
if ($cmd) { $cf = $cmd.Source }
foreach ($p in @('C:\Program Files (x86)\cloudflared\cloudflared.exe', 'C:\Program Files\cloudflared\cloudflared.exe')) { if (-not $cf -and (Test-Path $p)) { $cf = $p } }
if (-not $cf) { Write-Host 'cloudflared nao encontrado. Instale com: winget install --id Cloudflare.cloudflared -e'; exit 1 }

# mesa antiga esquecida: fechar a janela no X nao roda o finally, e o servidor e o tunel ficam escondidos.
# So fecha o que ficou orfao (a janela que abriu ja nao existe); uma mesa aberta em outra janela continua.
function Test-Orfao($proc) { -not (Get-Process -Id $proc.ParentProcessId -ErrorAction SilentlyContinue) }
$escuta = Get-NetTCPConnection -LocalPort $Porta -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($escuta) {
  $dono = Get-CimInstance Win32_Process -Filter "ProcessId=$($escuta.OwningProcess)"
  if ($dono -and $dono.Name -eq 'node.exe' -and $dono.CommandLine -match 'servidor[/\\]index\.ts' -and (Test-Orfao $dono)) {
    Write-Host 'Fechando uma mesa antiga que tinha ficado aberta...'
    Get-CimInstance Win32_Process -Filter "Name='cloudflared.exe'" |
      Where-Object { $_.CommandLine -match "localhost:$Porta\b" -and (Test-Orfao $_) } |
      ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    Stop-Process -Id $dono.ProcessId -Force -ErrorAction SilentlyContinue
    for ($i = 0; $i -lt 20 -and (Get-NetTCPConnection -LocalPort $Porta -State Listen -ErrorAction SilentlyContinue); $i++) { Start-Sleep -Milliseconds 250 }
  }
}

# a porta precisa estar livre
if (Get-NetTCPConnection -LocalPort $Porta -State Listen -ErrorAction SilentlyContinue) { Write-Host "A porta $Porta ja esta em uso (a mesa ja esta aberta em outra janela?)."; exit 1 }

# cliente compilado: compila na primeira vez e sempre que o codigo da interface for mais novo que a versao compilada
$compilado = Join-Path $raiz 'cliente\dist\index.html'
$fontes = @(Get-ChildItem (Join-Path $raiz 'cliente\src'), (Join-Path $raiz 'cliente\public') -Recurse -File) + @(Get-Item (Join-Path $raiz 'cliente\index.html'))
$maisNovo = ($fontes | Measure-Object -Property LastWriteTime -Maximum).Maximum
if (-not (Test-Path $compilado) -or (Get-Item $compilado).LastWriteTime -lt $maisNovo) {
  Write-Host 'Preparando a interface...'
  npm run cliente:build | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host 'Nao foi possivel compilar a interface (rode: npm run cliente:build).'; exit 1 }
}

$logServidor = Join-Path $cache 'mesa-servidor.log'
$logTunel = Join-Path $cache 'mesa-tunel.log'
Remove-Item $logServidor, $logTunel -ErrorAction SilentlyContinue

$env:HTTPS = '1'
$env:PORTA = "$Porta"
$servidor = Start-Process -FilePath node -ArgumentList 'servidor/index.ts' -WorkingDirectory $raiz -WindowStyle Hidden -PassThru -RedirectStandardOutput $logServidor -RedirectStandardError "$logServidor.err"
$tunel = $null
try {
  # espera o servidor responder
  $pronto = $false
  for ($i = 0; $i -lt 60 -and -not $pronto; $i++) {
    Start-Sleep -Milliseconds 500
    try { $r = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:$Porta/" -TimeoutSec 2; $pronto = ($r.StatusCode -eq 200) } catch { }
    if ($servidor.HasExited) { break }
  }
  if (-not $pronto) { Write-Host 'O servidor nao subiu. Veja .cache\mesa-servidor.log'; Get-Content "$logServidor.err" -ErrorAction SilentlyContinue | Select-Object -Last 10; exit 1 }

  # tunel rapido (sem conta): o endereco muda a cada vez que a mesa abre
  $tunel = Start-Process -FilePath $cf -ArgumentList @('tunnel', '--no-autoupdate', '--url', "http://localhost:$Porta") -WindowStyle Hidden -PassThru -RedirectStandardError $logTunel -RedirectStandardOutput "$logTunel.out"
  $url = $null
  for ($i = 0; $i -lt 90 -and -not $url; $i++) {
    Start-Sleep -Milliseconds 500
    $m = Select-String -Path $logTunel -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($m) { $url = $m.Matches[0].Value }
    if ($tunel.HasExited) { break }
  }
  if (-not $url) { Write-Host 'O tunel nao abriu. Veja .cache\mesa-tunel.log'; Get-Content $logTunel -ErrorAction SilentlyContinue | Select-Object -Last 10; exit 1 }

  $senha = $env:SENHA_ACESSO
  # [string]: o texto lido pelo Get-Content traz metadados que atrapalham o JSON
  if (-not $senha) { $senha = [string](Get-Content (Join-Path $raiz 'dados-locais\senha-acesso.txt') -ErrorAction SilentlyContinue | Select-Object -First 1) }

  Write-Host ''
  Write-Host '=============================================================='
  Write-Host ' A mesa esta aberta.'
  Write-Host " Endereco para o grupo: $url"
  Write-Host " Senha de acesso:       $senha"
  Write-Host " Neste computador:      http://localhost:$Porta"
  Write-Host '=============================================================='
  Write-Host ''

  if ($Teste) {
    # confere o endereco publico: a pagina e o login com a senha
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $ok = $false
    $erro = ''
    # o endereco novo leva alguns segundos para valer no DNS
    for ($i = 0; $i -lt 40 -and -not $ok; $i++) {
      try { $r = Invoke-WebRequest -UseBasicParsing -Uri "$url/" -TimeoutSec 10; $ok = ($r.StatusCode -eq 200 -and $r.Content -match '<div id="app"') } catch { $erro = $_.Exception.Message; Start-Sleep -Seconds 3 }
    }
    Write-Host "TESTE pagina pelo tunel: $ok $erro"
    $login = $false
    try {
      $r = Invoke-WebRequest -UseBasicParsing -Uri "$url/api/entrar" -Method Post -ContentType 'application/json' -Body ('{"senha":"' + $senha + '"}') -TimeoutSec 15
      $cookie = [string]$r.Headers['Set-Cookie']
      $login = ($r.StatusCode -eq 200 -and $cookie -match 'Secure')
      if (-not $login) { Write-Host "login: status $($r.StatusCode), cookie '$cookie'" }
    } catch { Write-Host "login: $($_.Exception.Message)" }
    Write-Host "TESTE login pelo tunel (cookie seguro): $login"
    $errado = $false
    try { Invoke-WebRequest -UseBasicParsing -Uri "$url/api/entrar" -Method Post -ContentType 'application/json' -Body '{"senha":"errada"}' -TimeoutSec 15 | Out-Null } catch { $errado = ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 401) }
    Write-Host "TESTE senha errada recusada: $errado"
    # WebSocket pelo tunel (a partida inteira passa por ele)
    node (Join-Path $raiz 'ferramentas\testa-tunel.ts') $url $senha
    $ws = ($LASTEXITCODE -eq 0)
    if (-not ($ok -and $login -and $errado -and $ws)) { exit 1 }
    exit 0
  }

  Write-Host 'Deixe esta janela aberta durante a partida. Aperte Enter para fechar a mesa.'
  [void](Read-Host)
}
finally {
  if ($tunel -and -not $tunel.HasExited) { Stop-Process -Id $tunel.Id -Force -ErrorAction SilentlyContinue }
  if ($servidor -and -not $servidor.HasExited) { Stop-Process -Id $servidor.Id -Force -ErrorAction SilentlyContinue }
  Write-Host 'Mesa fechada.'
}
