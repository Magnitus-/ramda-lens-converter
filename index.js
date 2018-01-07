const R = require('ramda');

const capitalize = (str) => {
     return str.charAt(0).toUpperCase() + str.substring(1)
}

const setProperty = R.curry((propKey, lensManip, lens, invertedArguments) => {
   return R.ifElse(
       () => (invertedArguments && lensManip !== R.view),
       R.assoc(propKey, R.flip(lensManip(lens))),
       R.assoc(propKey, lensManip(lens))
   )
})

const keyToProperties = R.curry((lenses, key, format, invertedArguments) => {
    if(format === 'camelCase') {
        return R.compose(
            setProperty('over' + capitalize(key), R.over, lenses[key], invertedArguments),
            setProperty('get' + capitalize(key), R.view, lenses[key], invertedArguments),
            setProperty('set' + capitalize(key), R.set, lenses[key], invertedArguments)
        )({})
    } else if(format === 'subProperties') {
        return R.assoc(
            key,
            R.compose(
                setProperty('over', R.over, lenses[key], invertedArguments),
                setProperty('get', R.view, lenses[key], invertedArguments),
                setProperty('set', R.set, lenses[key], invertedArguments)
            )({}),
            {}
        )
        /*return R.converge(
            R.assoc(key),
            [
                R.compose(
                    setProperty('over', R.over, lenses[key], invertedArguments),
                    setProperty('get', R.view, lenses[key], invertedArguments),
                    setProperty('set', R.set, lenses[key], invertedArguments)
                ),
                R.identity
            ]
        )({});*/
    }
});

function lensToProperties(lens, format='camelCase', invertedArguments=false) {
    return R.compose(
        R.mergeAll,
        R.map(keyToProperties(lens, R.__, format, invertedArguments)),
        R.keys
    )(lens);
}

module.exports = {
    lensToProperties
}
