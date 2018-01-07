const R = require('ramda');
const {
    lensToProperties
} = require('../');

const lastCIndex = R.compose(R.subtract(R.__, 1), R.length, R.path(['b', 'c']));

const assocLastC = R.curry((val, inst) => {
    return R.converge(
        R.assocPath(R.__, val, R.__),
        [
            R.compose(
                R.append(R.__, ['b', 'c']),
                lastCIndex
            ),
            R.identity
        ]
    )(inst)
});

const lens = {
    a: R.lensProp('a'),
    c: R.lensPath(['b', 'c']),
    lastC: R.lens(
        R.compose(R.last, R.path(['b', 'c'])),
        assocLastC
    )
};

module.exports = {
    main: (test) => {
        test.expect(9);
        const props = lensToProperties(lens);
        const testVal = {
            'a': 1,
            'b': {
                'c': [2, 3]
            }
        };

        test.ok(props.getA && R.equals(props.getA(testVal), 1), "Ensure first getter works as espected");
        test.ok(props.getC && R.equals(props.getC(testVal), [2, 3]), "Ensure second getter works as espected");
        test.ok(props.getLastC && R.equals(props.getLastC(testVal), 3), "Ensure third getter works as espected");

        test.ok(
            props.setA &&
            R.compose(
                R.equals(4),
                props.getA,
                props.setA(4)
            )(testVal),
            "Ensure first setter works as expected"
        );

        test.ok(
            props.setC &&
            R.compose(
                R.equals([5,6]),
                props.getC,
                props.setC([5,6])
            )(testVal),
            "Ensure second setter works as expected"
        );

        test.ok(
            props.setLastC &&
            R.compose(
                R.equals(7),
                props.getLastC,
                props.setLastC(7)
            )(testVal),
            "Ensure third setter works as expected"
        );

        test.ok(
            props.overA &&
            R.compose(
                R.equals(2),
                props.getA,
                props.overA(R.add(1))
            )(testVal),
            "Ensure first 'functor' works as expected"
        );

        test.ok(
            props.overC &&
            R.compose(
                R.equals([2, 3, 4]),
                props.getC,
                props.overC(R.append(4))
            )(testVal),
            "Ensure second 'functor' works as expected"
        );

        test.ok(
            props.overLastC &&
            R.compose(
                R.equals(4),
                props.getLastC,
                props.overLastC(R.add(1))
            )(testVal),
            "Ensure third 'functor' works as expected"
        );

        test.done();
    },
    invertArguments: (test) => {
        test.expect(9);
        const props = lensToProperties(lens, {'invertArguments': true});
        const testVal = {
            'a': 1,
            'b': {
                'c': [2, 3]
            }
        };

        test.ok(props.getA && R.equals(props.getA(testVal), 1), "Ensure first getter works as espected");
        test.ok(props.getC && R.equals(props.getC(testVal), [2, 3]), "Ensure second getter works as espected");
        test.ok(props.getLastC && R.equals(props.getLastC(testVal), 3), "Ensure third getter works as espected");

        test.ok(
            props.setA &&
            R.compose(
                R.equals(4),
                props.getA,
                props.setA(R.__, 4)
            )(testVal),
            "Ensure first setter works as expected"
        );

        test.ok(
            props.setC &&
            R.compose(
                R.equals([5,6]),
                props.getC,
                props.setC(R.__, [5,6])
            )(testVal),
            "Ensure second setter works as expected"
        );

        test.ok(
            props.setLastC &&
            R.compose(
                R.equals(7),
                props.getLastC,
                props.setLastC(R.__, 7)
            )(testVal),
            "Ensure third setter works as expected"
        );

        test.ok(
            props.overA &&
            R.compose(
                R.equals(2),
                props.getA,
                props.overA(R.__, R.add(1))
            )(testVal),
            "Ensure first 'functor' works as expected"
        );

        test.ok(
            props.overC &&
            R.compose(
                R.equals([2, 3, 4]),
                props.getC,
                props.overC(R.__, R.append(4))
            )(testVal),
            "Ensure second 'functor' works as expected"
        );

        test.ok(
            props.overLastC &&
            R.compose(
                R.equals(4),
                props.getLastC,
                props.overLastC(R.__, R.add(1))
            )(testVal),
            "Ensure third 'functor' works as expected"
        );

        test.done();
    },
    subProperties: (test) => {
        test.expect(9);
        const props = lensToProperties(lens, {'format': 'subProperties'});
        const testVal = {
            'a': 1,
            'b': {
                'c': [2, 3]
            }
        };

        test.ok(R.path(['a', 'get'], props) && R.equals(props.a.get(testVal), 1), "Ensure first getter works as espected");
        test.ok(R.path(['c', 'get'], props) && R.equals(props.c.get(testVal), [2, 3]), "Ensure second getter works as espected");
        test.ok(R.path(['lastC', 'get'], props) && R.equals(props.lastC.get(testVal), 3), "Ensure third getter works as espected");

        test.ok(
            R.path(['a', 'set'], props) &&
            R.compose(
                R.equals(4),
                props.a.get,
                props.a.set(4)
            )(testVal),
            "Ensure first setter works as expected"
        );

        test.ok(
            R.path(['c', 'set'], props) &&
            R.compose(
                R.equals([5,6]),
                props.c.get,
                props.c.set([5,6])
            )(testVal),
            "Ensure second setter works as expected"
        );

        test.ok(
            R.path(['lastC', 'set'], props) &&
            R.compose(
                R.equals(7),
                props.lastC.get,
                props.lastC.set(7)
            )(testVal),
            "Ensure third setter works as expected"
        );

        test.ok(
            R.path(['a', 'over'], props) &&
            R.compose(
                R.equals(2),
                props.a.get,
                props.a.over(R.add(1))
            )(testVal),
            "Ensure first 'functor' works as expected"
        );

        test.ok(
            R.path(['c', 'over'], props) &&
            R.compose(
                R.equals([2, 3, 4]),
                props.c.get,
                props.c.over(R.append(4))
            )(testVal),
            "Ensure second 'functor' works as expected"
        );

        test.ok(
            R.path(['lastC', 'over'], props) &&
            R.compose(
                R.equals(4),
                props.lastC.get,
                props.lastC.over(R.add(1))
            )(testVal),
            "Ensure third 'functor' works as expected"
        );

        test.done();
    }
}
