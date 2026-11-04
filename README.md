# WORLD FOOTBALL 2027

Projeto de futebol para navegador, pensado para desktop e dispositivos móveis (PWA).

## Visão do produto
- Simulador de partidas 11 contra 11 com câmera lateral.
- Controles para teclado, gamepad e tela sensível ao toque.
- Ultimate Team: coleção de cartas, abertura de pacotes, evolução, mercado e leilões.
- Meu Clube: elenco, escalação, formação e táticas.
- Carreira, competições, eventos, amigos e ranking.
- Multiplayer online com validação autoritativa no servidor.
- Economia interna com saldo, inventário e transações protegidas.

## Arquitetura planejada
- **Frontend:** React + TypeScript + Vite (interface e PWA).
- **Camada 3D:** Three.js/WebGL para campo, jogadores, bola, câmera e animações.
- **Backend:** Supabase Auth, Postgres, Storage e Edge Functions para perfis, clubes, cartas, inventário e mercado.
- **Tempo real:** Supabase Realtime para eventos sociais/mercado; servidor dedicado/autoritativo para sincronização e validação das partidas multiplayer.

## Estado atual
A branch `feature/world-football-2027-foundation` contém a primeira fundação visual navegável: início, jogar, Meu Clube, cartas, mercado, leilões, carreira, competições e amigos. Dados e preços exibidos são demonstrativos; nenhuma transação, abertura real de pacote, partida ou multiplayer está ativo ainda.

## Executar localmente
```bash
npm install
npm run dev
```

## Roadmap técnico
1. Validar a fundação visual e navegação responsiva.
2. Configurar Supabase Auth, perfis e modelo de dados.
3. Implementar clube, elenco, cartas, inventário e economia segura.
4. Implementar pacotes com probabilidades publicadas e transações atômicas.
5. Implementar mercado e leilões com lances e encerramento validados no servidor.
6. Desenvolver campo 3D, câmera lateral, jogadores, bola, animações e física.
7. Criar servidor multiplayer autoritativo e matchmaking.
8. Adicionar carreira, ligas, eventos, social, anti-cheat e otimização.

## Regras de desenvolvimento
- Não remover funcionalidades sem autorização.
- Não apresentar dados de demonstração como dados reais.
- Nunca confiar no cliente para validar saldo, cartas, lances ou resultados.
- Implementar por módulos e validar cada etapa antes de ativar a próxima.


## Supabase: núcleo de economia e Ultimate Team

A migração inicial está em `supabase/migrations/202611040001_world_football_core.sql`.

1. Crie/abra o projeto Supabase que será usado pelo WORLD FOOTBALL 2027.
2. No Supabase, abra **SQL Editor** e execute o conteúdo completo da migração.
3. Configure as variáveis do frontend `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no ambiente da Lovable.
4. A migração cria perfis e clubes ao registrar usuários, saldo inicial de teste de 5.000 moedas, catálogo e pacote inicial.
5. As RPCs `wf_open_pack`, `wf_buy_market_listing`, `wf_place_bid` e `wf_finalize_auction` validam as operações no banco.

**Importante:** esta migração ainda precisa ser aplicada ao Supabase e conectada ao frontend. O saldo inicial é de teste; não representa dinheiro real. O catálogo atual contém jogadores fictícios/de demonstração. Antes de publicar, revise a política de bônus, as regras econômicas, os dados licenciados e os fluxos de cancelamento/expiração. As partidas 3D e o multiplayer continuam em uma etapa separada.
