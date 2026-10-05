# Workout Manager — Frontend Specification

## 1. Objetivo

Desenvolver o frontend web do **Workout Manager**, utilizando **React + TypeScript**, consumindo exclusivamente a API REST existente no backend desenvolvido em **Spring Boot**.

A aplicação deve permitir que o usuário:

- crie uma conta;
- faça login;
- cadastre e gerencie seus treinos;
- cadastre exercícios dentro de cada treino;
- inicie um treino previamente cadastrado;
- registre o peso/carga utilizado em cada exercício durante a execução;
- consulte seu histórico de treinos;
- acompanhe sua evolução de cargas;
- cadastre métricas corporais em diferentes datas;
- acompanhe a evolução das suas métricas corporais através de gráficos.

O produto deve ter uma experiência **mobile-first**, moderna e visualmente inspirada em academias modernas como a Smart Fit, utilizando principalmente **preto e amarelo**.

---

# 2. Stack do frontend

Utilizar:

- React
- TypeScript
- Vite
- React Router
- Biblioteca de componentes/UI adequada ao projeto, se necessário
- Biblioteca de gráficos adequada, como Recharts
- Fetch ou Axios para comunicação com a API
- CSS moderno / Tailwind CSS, caso já esteja configurado ou seja considerado adequado

A implementação deve priorizar:

- componentes reutilizáveis;
- tipagem forte com TypeScript;
- separação clara de responsabilidades;
- responsividade;
- acessibilidade;
- estados de loading;
- tratamento de erros;
- feedback visual das operações.

Não criar um backend mockado para substituir a API real.

---

# 3. Regra fundamental: integração com o backend

A IA terá acesso ao projeto backend Spring Boot.

Antes de implementar as chamadas da API, **analisar o backend existente** para identificar:

- endpoints disponíveis;
- métodos HTTP;
- DTOs;
- entidades;
- parâmetros;
- query parameters;
- payloads de request;
- payloads de response;
- autenticação;
- formato dos erros;
- códigos HTTP;
- relacionamentos entre recursos.

### Não inventar endpoints.

O frontend deve se adaptar à API existente.

Exemplo:

Se o backend possuir:

```text
POST /users
POST /auth/login
GET /workouts
POST /workouts
```

utilizar essas rotas.

Se os nomes forem diferentes, utilizar os nomes existentes no backend.

O mesmo vale para os modelos e propriedades dos objetos.

---

# 4. Identidade visual

## Tema

A aplicação deve possuir uma identidade visual predominantemente:

- preta;
- amarela;
- branca/cinza para informações secundárias.

Referência visual: **academia moderna / fitness / Smart Fit**, sem copiar identidade visual ou elementos proprietários.

### Paleta sugerida

```text
Background principal: #0B0B0B
Background secundário: #151515
Amarelo principal: #FFD600
Amarelo secundário: #FFC400
Texto principal: #FFFFFF
Texto secundário: #A3A3A3
Bordas: #292929
Erro: #EF4444
Sucesso: #22C55E
```

O amarelo deve ser utilizado principalmente para:

- CTAs;
- botões principais;
- indicadores;
- destaques;
- progresso;
- elementos ativos;
- gráficos;
- ícones importantes.

Evitar utilizar amarelo em excesso.

---

# 5. Design

O design deve ser:

- moderno;
- minimalista;
- esportivo;
- profissional;
- visualmente forte;
- mobile-first;
- fácil de utilizar durante um treino.

Evitar:

- excesso de informações na tela;
- cards gigantes;
- sombras exageradas;
- gradientes excessivos;
- interfaces genéricas de CRUD;
- aparência de sistema administrativo.

A aplicação deve parecer um **produto fitness**, e não um painel administrativo.

---

# 6. Responsividade

A prioridade deve ser:

```text
Mobile
↓
Tablet
↓
Desktop
```

No mobile:

- navegação inferior ou menu compacto;
- botões grandes;
- áreas de toque confortáveis;
- informações essenciais sempre visíveis;
- execução do treino extremamente simples;
- evitar tabelas horizontais sempre que possível.

No desktop:

- utilizar melhor o espaço disponível;
- permitir layouts com duas ou três colunas quando fizer sentido;
- manter a experiência visual consistente.

---

# 7. Autenticação

## Cadastro

Criar tela de cadastro.

Campos devem ser definidos de acordo com o DTO/API existente no backend.

Fluxo:

```text
Cadastro
   ↓
Validação
   ↓
POST para API
   ↓
Conta criada
   ↓
Redirecionar para Login ou Dashboard
```

Exibir mensagens claras de erro vindas da API.

---

# 8. Login

Criar tela de login.

Fluxo:

```text
Login
   ↓
API
   ↓
Autenticação
   ↓
Salvar credencial/token conforme backend
   ↓
Dashboard
```

A implementação deve respeitar o mecanismo de autenticação existente no backend.

Não assumir JWT, sessão, cookie ou outro mecanismo antes de analisar o backend.

Rotas protegidas devem exigir autenticação.

---

# 9. Estrutura de navegação

A aplicação autenticada deve possuir uma navegação simples.

No mobile, preferencialmente utilizar uma **Bottom Navigation** com aproximadamente:

```text
┌──────────────────────────────────┐
│                                  │
│           Conteúdo               │
│                                  │
├──────────────────────────────────┤
│ 🏠       💪       📊       👤    │
│ Início  Treinos  Progresso Perfil│
└──────────────────────────────────┘
```

A navegação pode ser adaptada conforme a quantidade de funcionalidades.

---

# 10. Dashboard

Após o login, o usuário deve chegar ao Dashboard.

O Dashboard deve apresentar uma visão rápida do estado atual do usuário.

Possíveis informações:

### Saudação

```text
Bom dia, Alisson 👋
```

### Treino atual/próximo

Card de destaque:

```text
TREINO A

Peito + Tríceps

8 exercícios

[ INICIAR TREINO ]
```

### Resumo

Cards compactos:

```text
Treinos
12

Esta semana
4

Maior carga
80 kg

Sequência
5 dias
```

As informações devem ser baseadas nos dados realmente disponíveis no backend.

Não criar métricas que o backend não permita calcular.

---

# 11. Gerenciamento de treinos

Criar uma área chamada:

**Meus Treinos**

Deve permitir:

- listar treinos;
- visualizar detalhes;
- criar treino;
- editar treino;
- excluir treino;
- iniciar treino.

Exemplo visual:

```text
MEUS TREINOS

┌─────────────────────────────┐
│ TREINO A                    │
│ Peito + Tríceps             │
│ 6 exercícios                │
│                             │
│ [ INICIAR ]                 │
└─────────────────────────────┘

┌─────────────────────────────┐
│ TREINO B                    │
│ Costas + Bíceps             │
│ 7 exercícios                │
│                             │
│ [ INICIAR ]                 │
└─────────────────────────────┘
```

---

# 12. Criar treino

Criar formulário para cadastrar um treino.

Exemplo:

```text
Nome do treino
Descrição
```

Os campos reais devem respeitar o modelo existente no backend.

Após criar o treino, permitir adicionar exercícios.

---

# 13. Exercícios

Cada treino pode possuir vários exercícios.

Na tela de detalhes do treino:

```text
TREINO A

Peito + Tríceps

Exercícios

01
Supino reto
3 séries × 10 repetições

02
Supino inclinado
3 séries × 12 repetições

03
Tríceps pulley
4 séries × 10 repetições

[ + ADICIONAR EXERCÍCIO ]

[ INICIAR TREINO ]
```

A estrutura deve respeitar o modelo existente no backend.

---

# 14. Execução do treino

Essa é uma das funcionalidades mais importantes do sistema.

Quando o usuário clicar em:

```text
INICIAR TREINO
```

o frontend deve iniciar uma sessão de treino conforme as possibilidades oferecidas pelo backend.

A tela deve ser extremamente simples para uso durante o exercício.

Exemplo:

```text
TREINO A

Supino reto

Série 1
Carga
[ 60 kg ]

Repetições
[ 10 ]

[ CONCLUIR SÉRIE ]
```

Depois:

```text
Série 2
Carga
[ 65 kg ]

Repetições
[ 8 ]

[ CONCLUIR SÉRIE ]
```

O usuário deve conseguir registrar o desempenho de cada exercício.

---

# 15. Registro de carga

Para cada exercício realizado, permitir registrar informações disponíveis no backend, como:

- carga/peso;
- repetições;
- séries;
- observações;
- duração, caso suportada.

Não criar campos que não possuam correspondência com a API sem necessidade.

O usuário deve conseguir visualizar seu último desempenho para aquele exercício, quando essa informação estiver disponível.

Exemplo:

```text
Último treino

Supino reto
60 kg × 10

Hoje

Carga
65 kg

Repetições
8

[ REGISTRAR ]
```

Isso ajuda o usuário a acompanhar progressão durante o próprio treino.

---

# 16. Finalização do treino

Ao terminar todos os exercícios:

```text
TREINO CONCLUÍDO 🎉

Duração
52 min

Exercícios
7

Séries
21

Carga total
XXX kg

[ CONCLUIR ]
```

As métricas exibidas devem ser calculadas somente quando os dados necessários estiverem disponíveis.

Após finalizar:

```text
Treino salvo com sucesso.
```

Redirecionar para o histórico ou Dashboard.

---

# 17. Histórico de treinos

Criar tela para visualizar treinos realizados.

Exemplo:

```text
HISTÓRICO

Hoje
Treino A
Peito + Tríceps
52 min

02/10
Treino B
Costas + Bíceps
48 min

30/09
Treino A
Peito + Tríceps
55 min
```

Permitir abrir um treino realizado para visualizar os detalhes.

---

# 18. Progressão de treino

Criar uma área de **Progressão**.

O objetivo é permitir que o usuário veja sua evolução ao longo do tempo.

A progressão deve poder ser visualizada por exercício.

Exemplo:

```text
PROGRESSÃO

Supino reto

Carga máxima

80 kg

┌──────────────────────────┐
│                    ●     │
│                ●         │
│            ●             │
│       ●                  │
│  ●                       │
└──────────────────────────┘

Jan   Fev   Mar   Abr
```

Utilizar gráficos responsivos.

Possíveis gráficos:

- carga ao longo do tempo;
- repetições ao longo do tempo;
- volume de treino;
- evolução por exercício.

**Somente implementar métricas que possam ser obtidas dos dados disponíveis no backend.**

---

# 19. Métricas corporais

Criar uma área específica:

**Medidas Corporais**

O usuário poderá registrar suas medidas em diferentes datas.

Exemplo:

```text
MEDIDAS CORPORAIS

01/10/2026

Peso
80,5 kg

Altura
180 cm

Peito
102 cm

Cintura
84 cm

Braço
38 cm

Coxa
58 cm

[ SALVAR MEDIDAS ]
```

Os campos devem ser definidos de acordo com a entidade/DTO existente no backend.

---

# 20. Histórico das medidas

O usuário deve conseguir visualizar todas as medições realizadas.

Exemplo:

```text
HISTÓRICO

04/10/2026
Peso: 79,8 kg
Cintura: 83 cm

01/10/2026
Peso: 80,5 kg
Cintura: 84 cm

20/09/2026
Peso: 82,0 kg
Cintura: 86 cm
```

As medições devem possuir uma data associada.

---

# 21. Progressão corporal

Criar gráficos para acompanhar a evolução das métricas corporais.

O usuário deve poder selecionar qual métrica deseja visualizar:

```text
Métrica

[ Peso ▼ ]
```

Opções disponíveis devem ser baseadas nos dados existentes.

Exemplo:

```text
Peso

82 kg ┤●
      │ \
80 kg ┤  ●
      │    \
78 kg ┤     ●──●
      └────────────────
       Set  Out
```

Também permitir:

```text
[ Peso ]
[ Cintura ]
[ Peito ]
[ Braço ]
[ Coxa ]
```

desde que essas métricas existam no backend.

---

# 22. Componentes reutilizáveis

Criar componentes reutilizáveis, por exemplo:

```text
components/
├── Button
├── Input
├── Card
├── Modal
├── Loading
├── EmptyState
├── ErrorMessage
├── WorkoutCard
├── ExerciseCard
├── ProgressChart
├── MetricCard
└── BottomNavigation
```

Não duplicar componentes visualmente equivalentes.

---

# 23. Estados de interface

Todas as chamadas para API devem tratar:

### Loading

Exibir feedback enquanto a requisição está sendo processada.

### Sucesso

Exibir feedback após operações importantes:

```text
Treino criado com sucesso.
Medidas salvas.
Exercício registrado.
```

### Erro

Mostrar mensagens compreensíveis.

Não exibir apenas:

```text
500 Internal Server Error
```

quando for possível obter uma mensagem adequada da API.

### Empty states

Quando o usuário ainda não possuir dados:

```text
Você ainda não possui treinos.

Crie seu primeiro treino para começar.

[ CRIAR TREINO ]
```

---

# 24. Proteção de rotas

Separar rotas públicas e privadas.

### Públicas

```text
/login
/register
```

### Privadas

```text
/
/workouts
/workouts/:id
/workouts/:id/start
/progress
/body-measurements
/profile
```

Os nomes devem ser adaptados à arquitetura final do frontend.

Usuário não autenticado tentando acessar área privada deve ser redirecionado para login.

Usuário autenticado não deve precisar voltar para a tela de login ao navegar entre páginas.

---

# 25. Gerenciamento de estado

Não utilizar gerenciamento global complexo sem necessidade.

Começar com:

- React state;
- Context API quando necessário;
- estado específico por página/componente.

Para dados vindos da API, pode ser utilizado React Query/TanStack Query se considerado adequado.

O objetivo é evitar:

- chamadas duplicadas;
- estados inconsistentes;
- excesso de código;
- armazenamento desnecessário.

---

# 26. Camada de API

Centralizar a comunicação com o backend.

Exemplo conceitual:

```text
src/
└── services/
    ├── api.ts
    ├── authService.ts
    ├── workoutService.ts
    ├── exerciseService.ts
    └── bodyMeasurementService.ts
```

Não colocar chamadas HTTP diretamente espalhadas pelos componentes.

Exemplo:

```typescript
workoutService.getWorkouts()
workoutService.createWorkout(data)
workoutService.startWorkout(id)
```

Os nomes devem ser adaptados aos endpoints reais encontrados no backend.

---

# 27. Tipagem

Criar interfaces/types TypeScript correspondentes aos DTOs do backend.

Exemplo conceitual:

```typescript
interface Workout {
    id: number;
    name: string;
    // demais propriedades conforme backend
}
```

Não inventar propriedades que não existem na API.

Sempre analisar os DTOs reais do Spring antes de criar os tipos.

---

# 28. API e autenticação

Criar uma camada HTTP centralizada para:

- URL base;
- headers;
- autenticação;
- tratamento de erros;
- interceptors, se Axios for utilizado.

A URL da API deve ser configurável por variável de ambiente.

Exemplo:

```env
VITE_API_URL=http://localhost:8080
```

Não hardcodar a URL da API em múltiplos arquivos.

---

# 29. Segurança

Nunca armazenar senha em texto puro.

O frontend deve apenas enviar a senha para o endpoint de autenticação/cadastro conforme especificado pelo backend.

Não implementar lógica de autenticação diferente da existente no backend.

Não colocar secrets no código frontend.

---

# 30. UX durante o treino

A tela de execução do treino deve receber atenção especial.

O usuário provavelmente estará:

- utilizando o celular;
- na academia;
- entre séries;
- com atenção limitada.

Portanto:

- botões grandes;
- alto contraste;
- poucos elementos;
- navegação rápida;
- informações essenciais em destaque;
- inputs fáceis de tocar;
- confirmação rápida de série;
- evitar formulários longos.

A carga utilizada deve ser uma das informações mais fáceis de registrar.

---

# 31. Responsividade mobile

No mobile, a tela de treino deve funcionar muito bem em aproximadamente:

```text
360px
390px
414px
```

Não permitir:

- overflow horizontal;
- textos cortados;
- botões pequenos;
- gráficos ilegíveis.

---

# 32. Desktop

No desktop, utilizar uma estrutura como:

```text
┌──────────────┬─────────────────────────────┐
│              │                             │
│   Sidebar    │         Conteúdo            │
│              │                             │
│ Dashboard    │                             │
│ Treinos      │                             │
│ Progressão   │                             │
│ Medidas      │                             │
│ Perfil       │                             │
│              │                             │
└──────────────┴─────────────────────────────┘
```

No mobile, transformar a navegação em Bottom Navigation ou menu compacto.

---

# 33. Arquitetura sugerida

Estrutura inicial:

```text
src/
├── assets/
├── components/
├── pages/
│   ├── auth/
│   │   ├── Login/
│   │   └── Register/
│   │
│   ├── dashboard/
│   ├── workouts/
│   ├── workout-session/
│   ├── progress/
│   ├── body-measurements/
│   └── profile/
│
├── components/
├── services/
├── hooks/
├── contexts/
├── types/
├── utils/
├── routes/
├── layouts/
└── App.tsx
```

A estrutura pode ser alterada caso exista uma arquitetura melhor para o projeto.

---

# 34. Fluxo principal do usuário

## Primeiro acesso

```text
Landing/Login
     ↓
Criar conta
     ↓
Cadastro realizado
     ↓
Login
     ↓
Dashboard
```

## Criar treino

```text
Dashboard
     ↓
Meus Treinos
     ↓
Criar Treino
     ↓
Cadastrar informações
     ↓
Adicionar exercícios
     ↓
Treino salvo
```

## Realizar treino

```text
Meus Treinos
     ↓
Selecionar treino
     ↓
Iniciar treino
     ↓
Exercício
     ↓
Registrar carga/repetições
     ↓
Próximo exercício
     ↓
Finalizar treino
     ↓
Histórico
```

## Acompanhar progressão

```text
Progressão
     ↓
Selecionar exercício
     ↓
Visualizar gráfico
     ↓
Evolução de carga/volume
```

## Acompanhar medidas

```text
Medidas Corporais
     ↓
Cadastrar nova medição
     ↓
Selecionar data
     ↓
Informar medidas
     ↓
Salvar
     ↓
Histórico
     ↓
Gráfico de evolução
```

---

# 35. Critérios de aceitação

A aplicação será considerada funcional quando:

### Autenticação

- [ ] Usuário consegue criar conta.
- [ ] Usuário consegue fazer login.
- [ ] Usuário não autenticado não acessa áreas privadas.
- [ ] Autenticação utiliza o mecanismo existente no backend.

### Treinos

- [ ] Usuário consegue visualizar seus treinos.
- [ ] Usuário consegue criar um treino.
- [ ] Usuário consegue editar um treino.
- [ ] Usuário consegue excluir um treino, caso suportado pela API.
- [ ] Usuário consegue adicionar exercícios.
- [ ] Usuário consegue remover/editar exercícios, caso suportado pela API.

### Execução

- [ ] Usuário consegue iniciar um treino.
- [ ] Usuário consegue registrar sua carga.
- [ ] Usuário consegue registrar repetições/séries quando suportado.
- [ ] Usuário consegue finalizar o treino.
- [ ] Treino realizado aparece no histórico.

### Progressão

- [ ] Usuário consegue visualizar histórico de desempenho.
- [ ] Usuário consegue visualizar progressão por exercício.
- [ ] Gráficos são responsivos.
- [ ] Dados apresentados são derivados da API.

### Medidas

- [ ] Usuário consegue cadastrar medidas.
- [ ] Cada registro possui uma data.
- [ ] Usuário consegue visualizar histórico.
- [ ] Usuário consegue visualizar progressão das medidas.
- [ ] Gráficos são responsivos.

### Interface

- [ ] Tema preto/amarelo.
- [ ] Interface mobile-first.
- [ ] Interface funciona em desktop.
- [ ] Loading states implementados.
- [ ] Error states implementados.
- [ ] Empty states implementados.
- [ ] Navegação intuitiva.
- [ ] Tela de execução de treino otimizada para celular.

---

# 36. Regra final para implementação

Antes de implementar qualquer integração:

1. analisar o backend Spring Boot;
2. identificar entidades e DTOs;
3. identificar endpoints;
4. identificar métodos HTTP;
5. identificar payloads;
6. identificar respostas;
7. identificar autenticação;
8. identificar relacionamentos;
9. identificar quais operações realmente estão disponíveis;
10. somente então implementar o frontend.

**Não criar endpoints fictícios.**

Quando alguma funcionalidade descrita nesta especificação não possuir suporte no backend, identificar a limitação e adaptar o frontend ao contrato existente em vez de criar uma API fictícia.

O objetivo é entregar um frontend React + TypeScript **realmente integrado ao backend Spring Boot existente**, com uma experiência moderna de aplicativo fitness, priorizando a experiência mobile.