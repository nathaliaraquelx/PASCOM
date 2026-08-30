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

O site está pronto a usar, mas contém texto de exemplo entre parênteses retos `[ ]` que deve ser
substituído por informação real da paróquia:

- **Contactos**: morada, telefone, email da secretaria (`index.html`, topo e secção *Contactos*).
- **Pároco**: nome, foto e nota biográfica (secção `#paroco`).
- **História**: datas e factos reais da paróquia (secção `#historia`).
- **Horários**: Missas, Confissões e Adoração (secções `#missas`, `#confissoes`, `#adoracao`).
- **Redes sociais**: os ícones de Instagram, Facebook, Comunidade de WhatsApp e TikTok apontam para
  `#` — substitua pelos links reais em **todas** as ocorrências (cabeçalho, secção *Contactos* e rodapé).
- **Evangelho do Dia / Santo do Dia**: mostram apenas a data atual; o texto deve ser atualizado
  diariamente pela equipa da PASCOM (ou ligado a uma fonte/API litúrgica da vossa confiança).
- **Galeria**: as fotos são placeholders com ícones; substitua os elementos `.gallery-tile` em
  `js/script.js` (array `galleryData`) por imagens reais (`<img src="assets/img/...">`).
- **Formulário de contacto**: é apenas uma demonstração no browser; ligue-o a um serviço de envio de
  email (ex.: Formspree, EmailJS) ou a um backend próprio para funcionar de facto.

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
