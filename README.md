# shabba

Shared split testing - a work in progress. May be abandoned.

## usage
```
const shabba = require('shabba');
const splitTest = shabba.start({ });
if (splitTest.ok()) {
  // something in the split test
}
splitTest.goal(); // optional
splitTest.finish();
```

## testing
```
npm test
```
