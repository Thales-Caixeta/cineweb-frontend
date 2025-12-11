
# CineWeb – Sistema Administrativo

Aplicação web desenvolvida em **React + Vite + TypeScript**, utilizando **Bootstrap**, **Bootstrap Icons**, **Zod** e **json-server** para simular a API REST.

O objetivo do sistema é permitir o gerenciamento administrativo de um cinema, incluindo:

- Cadastro de **filmes**
- Cadastro de **salas**
- Agendamento de **sessões**
- Venda de **ingressos** com modal interativo

---

## 🛠 Tecnologias Utilizadas

### **Frontend**
- React + Vite (TypeScript)
- React Router DOM
- Bootstrap 5
- Bootstrap Icons
- Zod (validações)
- Axios (requisições)

### **Backend Simulado**
- json-server (porta 3000)

---

## 📁 Estrutura da API (db.json)

```json
{
  "filmes": [],
  "salas": [],
  "sessoes": [],
  "ingressos": [],
  "lanches": [],
  "pedidos": []
}
```

---

## 🚀 Como Rodar o Projeto

### 1. Instale as dependências:

```
npm install
```

### 2. Inicie a API (json-server):

```
npm run api
```

A API ficará disponível em:

```
http://localhost:3000
```

Endpoints disponíveis:

- `/filmes`
- `/salas`
- `/sessoes`
- `/ingressos`

### 3. Inicie o frontend:

```
npm run dev
```

A aplicação abrirá em:

```
http://localhost:5173
```

---

## 📌 Funcionalidades

### 🎥 **Módulo de Filmes**
- Listagem em tabela
- Cadastro com validação Zod
- Select de gênero e classificação
- Exclusão

### 🏛 **Módulo de Salas**
- Cadastro de salas
- Select com números de 1 a 10
- Exclusão

### 🎬 **Módulo de Sessões**
- Select de filme e sala
- Validação de data (não retroativa)
- Listagem cruzando nome do filme e sala
- Exclusão

### 🎟 **Venda de Ingressos (Modal)**
- Modal ao clicar em “Vender”
- Informações da sessão
- Escolha entre **Inteira (R$ 34)** ou **Meia (R$ 17)**
- Inserção automática no banco (`/ingressos`)
- Sem campo editável de valor
- Mensagem de sucesso

---

## 🧱 Estrutura de Pastas

```
src/
  components/     → Navbar, Layout, etc.
  pages/          → Filmes, Salas, Sessoes
  models/         → Tipos e interfaces (TS)
  schemas/        → Validações com Zod
  services/       → Integração com API
  routers/        → Sistema de rotas
```

---

## 📝 Observações

- Os IDs são tratados como **string** para evitar problemas de comparação com o json-server.
- Todos os relacionamentos (filme ↔ sessão, sala ↔ sessão) estão 100% funcionais.
- O sistema está preparado para receber melhorias visuais posteriores.

---

## ✔ Projeto pronto para apresentação

Esse projeto já contempla:

- Requisitos funcionais
- Requisitos técnicos
- Persistência
- API REST completa
- UI organizada
- Modal funcional com lógica de negócio

A estrutura foi construída seguindo boas práticas e está pronta para ser apresentada ao professor.

---

Se quiser adicionar prints ou GIFs de demonstração, posso gerar a seção automaticamente.
