# Projeto de processo seletivo

## Descrição do projeto

A Invext é uma fintech que está estruturando sua central de relacionamento. Essa central de relacionamento irá atender diversos tipos de solicitações dos clientes. Os principais 
tipos de solicitações são: Problemas com cartão e contratação de empréstimo.

A fim de entregar a melhor experiência para seus clientes, a Invext organizou seus atendentes em 3 times de atendimento: Cartões, Empréstimos e Outros Assuntos. Agora, a Invext irá desenvolver um software que distribua as solicitações para o time correto de acordo com o seu tipo. Solicitações com assunto "Problemas com cartão", devem ser enviados para atendentes do time "Cartões". Solicitações de "contratação de empréstimo" devem ser encaminhadas para atendentes do time "Empréstimos", enquanto os demais assuntos, devem ir para atendentes do time "Outros Assuntos". 

É uma política da central de relacionamento que cada atendente atenda no máximo 3 pessoas de forma simultânea, e caso todos os atendentes de um time estejam ocupados, os atendimentos devem ser enfileirados e distribuídos assim que possível.

Desenvolva um software que resolva o problema de distribuição descrito acima. Caso necessário, esse software deve ter sua API disponibilizada no estilo REST.

## Requisitos

- O software deve ser desenvolvido utilizando a linguagem de programação JAVA ou Javascript.

## Soluções aplicadas

- Linguagem de programação Javascript, com o framework NextJS: ReactJS  para o front-end e NodeJS para o back-end.
- MySQL para o banco de dados.
- DBWalker (Biblioteca própria) para consumo simplificado do banco de dados.
- Bootstrap como biblioteca de estilização do front-end.
- Vercel para o deploy do front-end.
