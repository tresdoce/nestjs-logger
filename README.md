<div align="center">
    <img alt="nestjs-logger" width="250" height="auto" src="https://camo.githubusercontent.com/c704e8013883cc3a04c7657e656fe30be5b188145d759a6aaff441658c5ffae0/68747470733a2f2f6e6573746a732e636f6d2f696d672f6c6f676f5f746578742e737667" />
    <h3>NestJS - Logger</h3>
</div>

<p align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Node&message=v14.15.4&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Npm&message=v6.14.10&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJs&message=v8.2.6&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJs"/>
    <img alt="GitHub license" src="https://img.shields.io/github/license/tresdoce/nestjs-logger?style=flat"><br/>
    <img alt="GitHub Workflow Status" src="https://github.com/tresdoce/nestjs-logger/actions/workflows/master.yml/badge.svg?branch=master">
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/tresdoce/nestjs-logger?logoColor=FFFFFF&logo=Codecov&labelColor=#F01F7A">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=tresdoce_nestjs-logger&metric=alert_status" alt="sonarcloud">
    <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/tresdoce/nestjs-logger">
    <br/>
</p>

Esta dependencia está pensada para ser utilizada en [NestJs Starter](https://github.com/rudemex/nestjs-starter), o
cualquier proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencie)
- [⚙️ Configuración](#configurations)
- [👨‍💻️ Uso](#uso)
- [🖥 Logs](#logs)
- [📤 Commits](#commits)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJs Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v14.15.4 or higher ([Download](https://nodejs.org/es/download/))
- NPM v6.14.10 or higher
- NestJS v8.2.0 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencie"></a>

## 🛠️ Instalar dependencia

```
npm install @tresdoce/nestjs-logger
```

<a name="configurations"></a>

## ⚙️ Configuración

Para utilizar este módulo, es necesario instanciarlo en la creación de la `app` con su global interceptor y también en el módulo principal.

```typescript
// ./src/main.ts
import { LoggingInterceptor, LoggingService, LOGGIN_SERVICE } from '@tresdoce/nestjs-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LoggingService({isProd: process.env.NODE_ENV === "production", level: "info"}),
  });
  ...
  app.useGlobalInterceptors(new LoggingInterceptor(app.get<LoggingService>(LOGGIN_SERVICE)));
  ...
}
```

```typescript
// ./src/app.module.ts
import { LoggingModule } from '@tresdoce/nestjs-logger';
...

@Module({
  ...
  imports: [
    ...
    LoggingModule.register(),
    ...
  ],
  ...
})
```

<a name="uso"></a>

## 👨‍💻️ Uso

Para poder hacer uso de algún metódo del servicio que se exporta mediante este módulo, debes inyectar el token **LOGGING_SERVICE** en el constructor del servicio donde vas a utilizarlo, tipandolo como **LoggingService**.

Logs disponibles:
`log`
`error`
`warn`
`debug`
`verbose`

```typescript
// ./src/app.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { LoggingService, LOGGIN_SERVICE } from '@tresdoce/nestjs-logger';
...
@Injectable()
export class AppService {
  constructor(
    @Inject(LOGGIN_SERVICE) private logger: LoggingService,
  ) {}

  getHello(): string {
    this.logger.log("Log de prueba", "ContextoElastic");
  }
}
```

<a name="logs"></a>

## 🖥 Logs

Los diferentes formatos de logging según el metódo que estés invocando.

- Tipo log

```bash
[1641844177933] INFO (24552 on VDINAME):
    context: "This is an info context"
    msg: {
      "logger_name": "@tresdoce/nestjs-logger",
      "@timestamp": 1641844177933,
      "log_level": "INFO",
      "build_version": "1.0.0",
      "build_parent_version": "0.0.1",
      "log_type": "DEFAULT",
      "message": "This is an info log"
    }
```

- Tipo error

```bash
[1641844177936] ERROR (24552 on VDINAME):
    context: "This is an error context"
    msg: {
      "logger_name": "@tresdoce/nestjs-logger",
      "@timestamp": 1641844177936,
      "log_level": "ERROR",
      "build_version": "1.0.0",
      "build_parent_version": "0.0.1",
      "log_type": "DEFAULT",
      "message": "This is an error log",
      "stack_trace": "This is an error log"
    }
```

- Tipo warn

```bash
[1641844177939] WARN (24552 on VDINAME):
    context: "This is a warn context"
    msg: {
      "logger_name": "@tresdoce/nestjs-logger",
      "@timestamp": 1641844177939,
      "log_level": "WARN",
      "build_version": "1.0.0",
      "build_parent_version": "0.0.1",
      "log_type": "DEFAULT",
      "message": "This is a warn log"
    }
```

- Tipo debug

```bash
[1641844177943] DEBUG (24552 on VDINAME):
    context: "This is a debug context"
    msg: {
      "logger_name": "@tresdoce/nestjs-logger",
      "@timestamp": 1641844177943,
      "log_level": "DEBUG",
      "build_version": "1.0.0",
      "build_parent_version": "0.0.1",
      "log_type": "DEFAULT",
      "message": "This is a debug log"
    }
```

- Tipo verbose

```bash
[1641844177946] TRACE (24552 on VDINAME):
    context: "This is a verbose context"
    msg: {
      "logger_name": "@tresdoce/nestjs-logger",
      "@timestamp": 1641844177946,
      "log_level": "TRACE",
      "build_version": "1.0.0",
      "build_parent_version": "0.0.1",
      "log_type": "DEFAULT",
      "message": "This is a verbose log"
    }
```

<a name="commits"></a>

## 📤 Commits

Para los mensajes de commits se toma como
referencia [`conventional commits`](https://www.conventionalcommits.org/en/v1.0.0-beta.4/#summary).

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

- **type:** chore, docs, feat, fix, refactor (más comunes)
- **scope:** indica la página, componente, funcionalidad
- **description:** comienza en minúsculas y no debe superar los 72 caracteres.

## 📄 Changelog

All notable changes to this package will be documented in [Changelog](./CHANGELOG.md) file.

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="./.readme-static/logo-mex-red.svg" width="120" alt="Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
