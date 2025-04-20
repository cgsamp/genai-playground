🧠 GenAI Bookstore — Project Context
This document provides a concise technical overview of the local development environment and backend technology stack for the GenAI Bookstore project. It is intended to support experienced Spring developers who are familiar with the relevant tooling and libraries, particularly Spring AI.

🧰 Toolchain & Development Environment
Code & Build Tools
Editor: Visual Studio Code

Configured to use the integrated terminal with zsh

Tabs automatically expanded to 4 spaces

Hidden files are visible (for editing .env, .gitignore, etc.)

Open the project by navigating directly into the backend/ folder (which contains pom.xml)

Java Version: 21

Build Tool: Apache Maven

Plugin: spring-boot-maven-plugin

Compiler target: release 21

Occasionally clear local caches:

bash
Copy
Edit
mvn dependency:purge-local-repository -DmanualInclude="org.springframework.ai"
☕ Spring Boot Stack
Core Versions
Spring Boot: 3.4.4

Spring AI: 1.0.0-M7
↳ Chosen as the closest version to GA per official Spring AI Upgrade Notes

Spring AI Dependencies
Imported via BOM:

xml
Copy
Edit
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.ai</groupId>
      <artifactId>spring-ai-bom</artifactId>
      <version>1.0.0-M7</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
Active AI Components
spring-ai-core

spring-ai-openai

spring-ai-postgresml

Notes
Direct use of OpenAiChatModel instead of ChatModel (which is not exposed in M7)

API interaction requires full OpenAI model config (key, options, etc.)

🗄️ Database
PostgreSQL Configuration
Primary database: PostgreSQL

Vector search: pgvector (used in tandem with spring-ai-postgresml)

Access: Managed via pgAdmin

Permissions:

Ensure the public schema has appropriate access:

sql
Copy
Edit
GRANT CREATE ON SCHEMA public TO your_user;
GRANT USAGE ON SCHEMA public TO your_user;
Spring Integration
Reactive support via:

spring-boot-starter-data-r2dbc

r2dbc-postgresql:0.8.13.RELEASE

Runtime JDBC support via:

postgresql (JDBC driver for optional dev tooling)

🔐 Secrets & Environment Configuration
Local Development
.env file holds secrets like:

env
Copy
Edit
OPENAI_API_KEY=sk-...
SPRING_DATASOURCE_PASSWORD=...
Load with:

bash
Copy
Edit
source .env
Cloud Foundry Deployment
Environment variables must be set with:

bash
Copy
Edit
cf set-env <app-name> OPENAI_API_KEY sk-...
cf set-env <app-name> SPRING_DATASOURCE_PASSWORD ...
Code expects environment variables to be set, so local and deployed environments behave the same

📦 Summary

Category	Technology / Version
Java	21
Spring Boot	3.4.4
Spring AI	1.0.0-M7
AI Provider	OpenAI via spring-ai-openai
DB	PostgreSQL + pgvector
Reactive DB	r2dbc-postgresql 0.8.13
Editor	VS Code
Build Tool	Maven