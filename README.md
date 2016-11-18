# shabba

Shared split testing - a work in progress. May be abandoned.

## aims

- make split test use consistent across repos
- make split test cookie + tracking + test names consistent
- remove duplicate code and dependencies

## usage
```
const shabba = require('shabba')
const options = {
  variants: {
    show_original: 95,
    show_alternative: 5
  }
}
const experiment = shabba.start('my test name', options)
if (experiment.is('show_alternative')) {
  console.log('we are in the split test')
}
if (shabba('my test name').is(show_alternative')) {
  console.log('we are also in the split test')
}
// experiment.goal() // not implemented yet
// shabba('my test name').goal() // equivalent
experiment.finish()
// shabba('my test name').finish() // equivalent
```

## testing
```
npm test
```

## linting
Trialling http://standardjs.com here
```
npm run lint
```

## build
```
npm run build
```
creates an asset in dist/

