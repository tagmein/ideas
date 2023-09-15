# Ideas

Ideas component library for JavaScript

## Development

See `PORT` in `.env` file for the local development server port. The code is watched and will re-build automatically when there are changes. However, the app will not reload automatically in the browser, so a manual reload is required to see the changes.

```sh
npm install
npm start
```

## Serve

See `PORT` in `.env` file to configure the server port.

```sh
npm install
mkdir -p data
node server
```

## Bytecode Reference

```
ADVANCE <...path>                         adv
ARGUMENTS <...args>                       arg
ARGUMENTS_GET <name>                      argg
ARGUMENTS_ZERO                            argz
GET <...path>                             get
RUN                                       run
SET <...path>                             set
VALUE <value>                             value
AWAIT                                     await
FOR_EACH <array>                          each
ITERATOR_VALUE                            iterv
ITERATOR_INDEX                            iteri
ARGUMENTS_CONCAT <...args>                argc
ARGUMENTS_PUSH                            argp
CREATE_FUNCTION [<...names>] [<...code>]  fn
```

## Contributing

Pull requests are welcomed. All contributions must be licensed with the MIT license.

## License

    The MIT License (MIT)

    Copyright © 2023 Nathanael S. Ferrero

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
