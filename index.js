const R = require('ramda');

const capitalize = (str) => {
     return str.charAt(0).toUpperCase() + str.substring(1)
}

const setProperty = R.curry((propKey, lensManip, lens, invertArguments) => {
   return R.ifElse(
       () => (invertArguments && lensManip !== R.view),
       R.assoc(propKey, R.flip(lensManip(lens))),
       R.assoc(propKey, lensManip(lens))
   )
})

const keyToProperties = R.curry((lenses, key, format, invertArguments) => {
    if(format === 'camelCase') {
        return R.compose(
            setProperty('over' + capitalize(key), R.over, lenses[key], invertArguments),
            setProperty('get' + capitalize(key), R.view, lenses[key], invertArguments),
            setProperty('set' + capitalize(key), R.set, lenses[key], invertArguments)
        )({})
    } else if(format === 'subProperties') {
        return R.assoc(
            key,
            R.compose(
                setProperty('over', R.over, lenses[key], invertArguments),
                setProperty('get', R.view, lenses[key], invertArguments),
                setProperty('set', R.set, lenses[key], invertArguments)
            )({}),
            {}
        )
    }
});

function lensToProperties(lens, options) {
    const format = R.propOr('camelCase', 'format', options);
    const invertArguments = R.propOr(false, 'invertArguments', options);
    return R.compose(
        R.mergeAll,
        R.map(keyToProperties(lens, R.__, format, invertArguments)),
        R.keys
    )(lens);
}

module.exports = {
    lensToProperties
}
