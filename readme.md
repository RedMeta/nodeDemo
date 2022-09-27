
# Accorgimenti

## .gitignore

Nei project fatti con node.js puoi usare il file `.gitignore` per non far caricare su github dei file o delle cartelle

Nel gitignore si mette *smepre* `node_modules` dato l'elevato peso della cartella e dal fatto che poi vengono riscaricati con `npm i` 

La configurazione base per node.js la puoi trovare [qui](https://github.com/github/gitignore/blob/main/Node.gitignore)

## package.json

Nel package.json imposta sempre gli script per far partire l'applicazione e togli quello di default, in questo caso:

```json
{
    "scripts": {
        "start": "node index.js"
    }
}
```


Imposta anche l'author e la licenza

```json
{
    "auhtor": "RedMeta",
    "license": "MIT"
}
```

## Code format

Ti consiglio di usare un formattatore di codice per quando lavori con nodejs,
un'estensione buona è prettier https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

## More

Per il resto controlla i commenti che ho aggiunto al codice