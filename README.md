# Overview

This library is meant to help reduce the amount of boilerplate code when representing a model via ramda lens.

The library assumes that the model is broken down in objects containing methods meant to operate on a common data structure.

Note that the above modelization is still 100% functional (the objects act as buckets of methods meant to operate on a common data structure, nothing more).

Also, note that realistically, 100% of the model might not be representable via static lens and the generated object may need to be augmented with further methods.

# API

## lensToProperties

### Overview

This function to generate a properties object from a lens object. It has options that affects the generated object to better reflect user preferences.

### Signature

```
lensToProperties(lenses, options)
```

The method returns an object containing 3 100% functional methods for each lens: a getter, a setter and a functor-like function (ie, 'over').

The arguments are:

- **lenses**: An object of ramda lenses meant to operate on a common data structure.
- **options**: An object of properties that affects the return properties object. It has the following properties:
  * **format**: Defaults to **camelCase**. A property that affects the format of the generated object. For each **LensName** property of the **lenses** argument, **camelCase** will generate 3 function properties called **getLensName**, **setLensName** and **overLensName**. Conversely, for each **LensName** property of the **lenses** argument, **subProperties** will generate a corresponding object property of **LensName** containing 3 function properties: **get**, **set** and **over**.
  * **invertArguments**: Defaults to **false**. The generate **set** and **over** functions take 2 arguments: a structure to operate on and either a value to assign (**set**) or a function to operate on the lens value (**over**). If **invertArguments** is set to **false**, the structure to operate on will be the second argument (which will usually reduce the need to use the ramda placeholder). If **invertArguments** is set to **true**, the structure to operate on will be the first argument (which may be more intuitive to OO afficionados as it is closer in terms of ordering to the dot notation of class instance members).

### Example

Below, we'll use the library to modelize a square with 2 interactive properties: the dimension of any of its side and its area.

We'll vary the arguments to make clear the different formats the output can take.

```
//Here, we'll put the code that is common to all 3 variants of the example
const R = require('ramda');
const { lensToProperties } = require('ramda-lens-converter');

function setSideFromArea(area, inst) {
    return R.assoc('side', Math.pow(area, 0.5), inst);
}

function getArea(inst) {
    return Math.pow(inst.side, 2);
}

const lenses = {
    side: R.lensProp('side'),
    area: R.lens(getArea, setSideFromArea)
}
```

```
//Variant 1: Default arguments
const square = lensToProperties(lenses);

const squareInstance = square.setSide(4, {});

//Outputs 4
console.log(square.getSide(squareInstance));

//Outputs 16
console.log(square.getArea(squareInstance));

//Outputs 8
console.log(
    R.compose(
        square.getSide,
        square.setArea(64)
    )(squareInstance)  
);  

//Outputs 2
console.log(
    R.compose(
        square.getSide,
        square.overArea(R.divide(R.__, 4))
    )(squareInstance)  
);  
```

```
//Variant 2: Sub-properties rather than camel case
const square = lensToProperties(lenses, {'format': 'subProperties'});

const squareInstance = square.side.set(4, {});

//Outputs 4
console.log(square.side.get(squareInstance));

//Outputs 16
console.log(square.area.get(squareInstance));

//Outputs 8
console.log(
    R.compose(
        square.side.get,
        square.area.set(64)
    )(squareInstance)  
);  

//Outputs 2
console.log(
    R.compose(
        square.side.get,
        square.area.over(R.divide(R.__, 4))
    )(squareInstance)  
);  
```

```
//Variant 3: Lets also invert the arguments of set/over to make it more intuitive to some users
const square = lensToProperties(lenses, {'format': 'subProperties', 'invertArguments': true});

const squareInstance = square.side.set({}, 4);

//Outputs 4
console.log(square.side.get(squareInstance));

//Outputs 16
console.log(square.area.get(squareInstance));

//Outputs 8
console.log(
    R.compose(
        square.side.get,
        square.area.set(R.__, 64)
    )(squareInstance)  
);  

//Outputs 2
console.log(
    R.compose(
        square.side.get,
        square.area.over(R.__, R.divide(R.__, 4))
    )(squareInstance)  
);  
```

# Possible Future Improvements

## Arbitrary Nesting For subProperties Generation

Currently, the model is expected to be shallow (all lens at the top level).

While it would not be straightforward to envision an implementation of the 'camelCase' generation that is not shallow, the 'subProperties' generation should intuitively accomodate arbitrary sub-properties nesting (currently, it does not).

## Optional Value Object Generation

A possible enhancement of the library would be to add optional functionality to generate chainable value objects based on the models.

This would require some (not horrible, but not completely trivial) work as the easy naive approach to re-regenerate all member functions via partial evaluation with each new value iteration would not be very efficient.

Rather, I would envision putting all the member functions in a class prototype and wrapping the write functions (over and set) in wrappers that returns a new class instance with the new object value (generated naturally by the lenses).
