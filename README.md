# Floox 2

> Simple global state handling for React, inspired by Flux

## Getting Started

Install the package with this command:
```shell
npm install floox --save
```

## Backstory

While using Floox for a few months in my projects I encountered some problems. Those projects were isomorphic websites, and I quickly realised that `StateFromStoreMixin` was useless in such scenarios because of its ties to `floox` instances. There were also some areas that were overly complicated (events, multiple stores).

Floox 2 is a complete makeover of the previous API. It now has no dependencies (even got rid of the Event Emitter) and is quite lightweight (< 2kB gzipped + minified).

## Basic usage


## API


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code with `npm test`.

## License
Copyright (c) 2016 FatFisz. Licensed under the MIT license.
