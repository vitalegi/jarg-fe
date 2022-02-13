# JaRG - Just a RPG Game

[![Netlify Status](https://api.netlify.com/api/v1/badges/64ba06de-3a22-4013-869f-0696b70cbd14/deploy-status)](https://app.netlify.com/sites/jarg/deploys)

The game is available on [Netlify](https://jarg.netlify.app).

JaRG is a - hopefully not for long - simple RPG game. Game mechanics were inspired by Final Fantasy X and Disgaea.

**Why?**

Why not?

**Who is partecipating?**

Just me. If you want/are able to, feel free to contribute.

**When will it be ready?**

Idk, hopefully soon. Depends what you mean by "ready".

**Nothing is working, WTF?!**

If you find issues, please open a ticket on [GitHub](https://github.com/vitalegi/jarg-fe/issues).

## Project setup

```
npm install
```

If you are working with VSC, `File` &rarr; `Preferences` &rarr; `Settings` &rarr; `User Settings`, search `typescript.preferences.importModuleSpecifier` and set to `non-relative`.

### Compiles and hot-reloads for development

#### One time activity

```
npm install http-server -g
```

#### Development start-up

```
# Starts the appliction
npm run serve

# Starts the static assets site
http-server ../jarg-assets/static -p 8081 --cors -c-1 -g

# --cors: enable cors
# -c-1: max-age cache = -1s
# -g: enable gzip
```

Note: if you are using Visual Studio Code you can automate the startup process.

```
cd jarg-fe
mkdir .vscode
copy docs/vscode/tasks.json .vscode/tasks.json

# restart VSC
```

### Compiles and minifies for production

```
npm run build
```

### Run your unit tests

```
npm run test:unit
```

### Lints and fixes files

```
npm run lint
```

### Report build status

```
npm run report
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
