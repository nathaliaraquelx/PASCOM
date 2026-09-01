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

Início · Patrono (São Carlo Acutis) · História · Pároco · Liturgia · Evangelho do Dia · Santo do Dia ·
Horário das Missas · Confissões · Dias de Adoração · Catequese · Agenda Paroquial · Notícias ·
Grupos e Ordens Religiosas · Galeria de Imagens · Velas Virtuais · Contactos.

## Por preencher antes de publicar

Grande parte do conteúdo (contactos, pároco, horários de Missas/Confissões/Adoração, catequese,
grupos e história) já foi preenchida com dados reais a partir do Plano Pastoral 2025. Ainda falta:

- **Redes sociais**: os ícones de Instagram, Facebook, Comunidade de WhatsApp e TikTok apontam para
  `#` — substitua pelos links reais em **todas** as ocorrências (cabeçalho, secção *Contactos* e rodapé).
- **Galeria**: as fotos são placeholders com ícones; substitua os elementos `.gallery-tile` em
  `js/script.js` (array `galleryData`) por imagens reais (`<img src="assets/img/...">`).
- **Formulário de contacto**: é apenas uma demonstração no browser; ligue-o a um serviço de envio de
  email (ex.: Formspree, EmailJS) ou a um backend próprio para funcionar de facto.
- **História**: falta ainda o ano exato de fundação da paróquia (secção `#historia`, marcado `[Ano]`).
- **Notícias / Agenda**: só têm alguns exemplos reais; adicione mais conforme forem surgindo.

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
