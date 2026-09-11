# PASCOM — Paróquia de São João Baptista

Site institucional da Pastoral da Comunicação (PASCOM) da Paróquia de São João Baptista, Diocese de Bragança-Miranda. Padroeiro: São Carlo Acutis.

## Estrutura

```
index.html        Página única com todas as secções
css/style.css      Estilos (azul, amarelo e branco)
js/script.js       Interações: menu, tabs, acordeão, galeria/lightbox, velas virtuais, formulários
assets/img/        Imagens e favicon
```

O site usa a Google Fonts (Poppins/Inter) e o Font Awesome via CDN para os tipos de letra e ícones.

## Secções incluídas

Início · Patrono (São Carlo Acutis) · História · Pároco · Evangelho do Dia · Santo do Dia ·
Horário das Missas · Confissões · Dias de Adoração · Catequese · Agenda Paroquial · Notícias ·
Grupos e Ordens Religiosas · Galeria de Imagens · Velas Virtuais · Contactos.

## Por preencher antes de publicar

Grande parte do conteúdo (contactos, pároco, horários de Missas/Confissões/Adoração, catequese,
grupos e história) já foi preenchida com dados reais a partir do Plano Pastoral 2025. Ainda falta:

- **Redes sociais**: Instagram e Facebook já têm os links reais. Os ícones de Comunidade de
  WhatsApp e TikTok ainda apontam para `#` — substitua pelos links reais assim que existirem, em
  **todas** as ocorrências (cabeçalho, secção *Contactos* e rodapé).
- **Galeria**: as fotos são placeholders com ícones; substitua os elementos `.gallery-tile` em
  `js/script.js` (array `galleryData`) por imagens reais (`<img src="assets/img/...">`).
- **Slideshow do topo**: as duas fotos em `assets/img/hero/` (Sé Catedral e Catedral Nova) são fotos
  de Bragança com licença aberta (Wikimedia Commons), usadas só como ponto de partida — substitua por
  fotos próprias da paróquia assim que possível (ver secção abaixo).
- **História**: falta ainda o ano exato de fundação da paróquia (secção `#historia`, marcado `[Ano]`).
- **Notícias**: mostra 3 cartões de exemplo até a Google Sheet "índice" ser configurada — ver
  secção "Notícias (artigos completos)" abaixo.
- **Agenda**: só tem exemplos reais até o Google Calendar ficar com eventos futuros.

## Evangelho e Santo do Dia (automático)

O Evangelho do Dia e o Santo do Dia são atualizados automaticamente todas as manhãs por um
GitHub Action (`.github/workflows/liturgia-diaria.yml`), que:

1. Descarrega a liturgia do dia (em português) do feed público da
   [Evangelizo](https://evangelizo.org), um serviço católico gratuito feito precisamente para
   isto — não é um feed oficial do Vaticano/CNBB, por isso não há garantia de disponibilidade.
2. Corre `scripts/gerar-liturgia.py` para converter o XML recebido em `data/liturgia-hoje.json`.
3. Faz *commit* e *push* desse ficheiro — o site lê-o (`js/script.js`) e preenche as duas secções.

Se o pedido falhar num dia (feed em baixo, etc.), o `data/liturgia-hoje.json` do dia anterior
mantém-se e o site simplesmente mostra o conteúdo de ontem em vez de ficar em branco.

**Importante:** o GitHub só corre automaticamente workflows agendados (`schedule`) que estejam
na *branch principal* (default) do repositório. Se a branch publicada no GitHub Pages não for
essa, mude-a em **Settings → General → Default branch**, ou o Evangelho/Santo do dia deixam de
atualizar sozinhos (pode sempre correr o workflow manualmente em **Actions → Atualizar liturgia
diária → Run workflow**, seja qual for a branch principal).

## Agenda Paroquial (sincronizada com o Google Calendar)

A Agenda Paroquial já não é editada diretamente no código: os eventos vivem no **Google
Calendar público da paróquia**, e um GitHub Action (`.github/workflows/agenda-google-calendar.yml`)
sincroniza-os com o site todos os dias:

1. Descarrega o feed público (`.ics`) desse calendário.
2. Corre `scripts/gerar-eventos.py`, que expande eventos recorrentes e gera `js/eventos.js`.
3. Faz *commit* e *push* — o widget do calendário (`js/calendario.js`) lê esse ficheiro.

**Para adicionar/editar/remover eventos**, edite-os diretamente no Google Calendar da paróquia —
não em `js/eventos.js` (esse ficheiro é reescrito todos os dias e qualquer edição manual é
perdida no sincronismo seguinte).

**Categoria do evento** — defina começando o título do evento no Google Calendar com uma destas
etiquetas entre parênteses retos (a etiqueta não aparece no site, só a categoria e a cor):

| Etiqueta no título   | Categoria no site |
|-----------------------|-------------------|
| `[Liturgico]`          | Vida Litúrgica (roxo) |
| `[Catequese]`          | Catequese (verde) |
| `[Comunidade]`         | Comunidade (azul) |
| `[Festa]`              | Festas (dourado) |
| *(sem etiqueta)*       | Comunidade (azul) |

`AgendaAdmin.html` continua disponível só para pré-visualizar rapidamente como um evento vai
ficar, em computador local — não é mais o sítio para publicar eventos a sério.

Está sujeita à mesma limitação de *branch* principal descrita acima para o Evangelho/Santo do dia.

## Notícias (artigos completos)

A secção *Notícias* também não é editada diretamente no código: cada artigo é escrito pelo pároco
(ou por quem trata das notícias) num **Google Doc**, e um GitHub Action
(`.github/workflows/noticias.yml`) gera automaticamente a página do artigo e o cartão que aparece
no site, a partir de uma **Google Sheet "índice"**.

### Configuração inicial (uma vez)

1. Crie uma Google Sheet nova com estas colunas na primeira linha (por esta ordem):

   | `data` | `titulo` | `resumo` | `link_doc` | `imagem` | `publicar` |
   |--------|----------|----------|------------|----------|------------|

   - `data`: no formato `AAAA-MM-DD` (ex.: `2026-09-11`).
   - `titulo` / `resumo`: título do artigo e o resumo curto que aparece no cartão.
   - `link_doc`: o link de "Publicar na Web" do Google Doc do artigo (ver abaixo).
   - `imagem` (opcional): um URL de imagem para a miniatura do cartão. Se ficar vazio, usa-se a
     primeira imagem do próprio artigo (se houver) ou um ícone genérico.
   - `publicar` (opcional): escreva `nao` para esconder um artigo sem apagar a linha (rascunho).
     Vazio ou `sim` = publicado.

2. Publique a Sheet como CSV: **Ficheiro → Partilhar → Publicar no Web** → escolha a folha certa →
   formato **CSV** → **Publicar**. Copie o URL gerado.
3. Em `.github/workflows/noticias.yml`, substitua `SEU_CSV_URL_AQUI` (variável
   `NOTICIAS_SHEET_CSV_URL`) por esse URL, e faça *commit*/*push*.

### Publicar um artigo novo (sempre que houver notícia)

1. Escreva o artigo num **Google Doc** novo — título, texto, negrito/itálico, títulos internos
   (estilos "Título 1"/"Título 2" do Docs), listas, links e imagens funcionam.
2. **Ficheiro → Partilhar → Publicar no Web** → **Publicar** → copie o link gerado.
3. Acrescente uma linha na Google Sheet "índice" com a data, título, resumo, esse link e,
   opcionalmente, uma imagem de capa.
4. No sincronismo seguinte (a cada 2 horas, ou manualmente em **Actions → Publicar notícias
   (Google Docs) → Run workflow**), o Action gera `noticias/<slug-do-artigo>.html` com o texto
   completo e atualiza os cartões da secção *Notícias* em `index.html` — mostra sempre os 9
   artigos mais recentes.

**Formatação suportada:** parágrafos, negrito, itálico, sublinhado, títulos internos, listas,
ligações e imagens. Não suporta tabelas, colunas ou layouts mais complexos do Google Docs — esse
conteúdo aparece só como texto simples.

**Nota:** remover uma linha da Sheet (ou marcar `publicar` como `nao`) tira o artigo da lista, mas
o ficheiro `noticias/<slug>.html` já gerado não é apagado automaticamente (fica só "não listado" —
continua acessível a quem tiver o link direto). Para o remover de vez, apague o ficheiro à mão.

Está sujeita à mesma limitação de *branch* principal descrita acima para o Evangelho/Santo do dia.

## Slideshow do topo (fotos das igrejas)

A secção inicial (`#inicio`) mostra um slideshow de fotos em fundo, com transição suave (*crossfade*)
a cada ~6,5 segundos — respeita a preferência do sistema "reduzir movimento" (`prefers-reduced-motion`),
caso em que fica só a primeira foto, sem animação.

As imagens estão em `assets/img/hero/` e são listadas em `index.html`, dentro de
`.hero-slideshow` — cada foto é um `<div class="hero-slide">` com `background-image`:

```html
<div class="hero-slideshow" aria-hidden="true">
  <div class="hero-slide active" style="background-image:url('assets/img/hero/se-catedral.jpg')"></div>
  <div class="hero-slide" style="background-image:url('assets/img/hero/catedral-nova.jpg')"></div>
</div>
```

**Para adicionar, remover ou substituir fotos:**

1. Coloque o ficheiro de imagem em `assets/img/hero/` (fotos horizontais, boa luz, idealmente
   ≥1280px de largura para ficarem nítidas em ecrãs grandes).
2. Adicione/edite um `<div class="hero-slide" style="background-image:url('assets/img/hero/NOME.jpg')"></div>`
   dentro de `.hero-slideshow` (mantenha `class="hero-slide active"` só no primeiro).
3. Se a foto não for própria da paróquia, adicione o crédito em `.hero-photo-credit` (mesmo bloco,
   logo a seguir) e confirme a licença antes de usar.

As duas fotos atuais (Sé Catedral de Bragança e Catedral Nova/Nossa Senhora Rainha) são do Wikimedia
Commons, com licença Creative Commons que exige atribuição (CC BY-SA 2.0 e CC BY 2.0, créditos no
rodapé do slideshow) — servem só como ponto de partida até a paróquia ter fotos próprias das suas
igrejas para colocar no lugar.

## Formulário de contacto

O formulário da secção *Contactos* envia as mensagens por email para
**sjbaptistaparoquiacom@gmail.com**, usando o [Formspree](https://formspree.io) — um serviço
gratuito que recebe o envio do formulário e reencaminha por email, sem precisar de servidor
próprio. Já está configurado e ativo (endpoint em `index.html`, no atributo `action` do
`<form id="contactForm" ...>`).

O plano gratuito do Formspree permite 50 mensagens por mês, suficiente para um formulário de
contacto de uma paróquia. Se for necessário mais, é possível ligar a um plano pago, ou trocar por
outro formulário/serviço:

1. Em [formspree.io](https://formspree.io), entre na conta `sjbaptistaparoquiacom@gmail.com` e
   crie ou escolha o formulário a usar.
2. Copie o novo **endpoint** (`https://formspree.io/f/...`) e substitua-o no `action` do
   `<form id="contactForm" ...>` em `index.html`.
3. Faça *commit* e *push* — depois de publicado, teste o formulário no site e confirme que chega
   o email (a mensagem de sucesso/erro aparece por baixo do botão "Enviar Mensagem").

## Velas Virtuais

A funcionalidade de velas guarda os pedidos de oração no `localStorage` do navegador de quem visita o
site — ou seja, cada pessoa só vê as velas que acendeu no seu próprio dispositivo. Para uma lista de
velas partilhada por todos os visitantes é necessário ligar a uma base de dados/backend.

## Publicar o site (GitHub Pages)

1. Faça *push* deste repositório para o GitHub.
2. Em **Settings → Pages**, escolha a branch principal e a pasta `/ (root)`.
3. O site fica disponível em `https://<utilizador>.github.io/<repositorio>/`.

## Desenvolvimento local

Não é necessário qualquer build. Basta abrir `index.html` num navegador, ou correr um servidor local:

```bash
python3 -m http.server 8000
```

e aceder a `http://localhost:8000`.
