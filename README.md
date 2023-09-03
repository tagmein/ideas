# Ideas

Ideas component library for TypeScript

## Development

See `PORT` in `.env` file for the local development server port. The code is watched and will re-build automatically when there are changes. However, the app will not reload automatically in the browser, so a manual reload is required to see the changes.

```sh
npm install
npm start
```

## Build

To build Plan, install dependencies and run the build command. Artifacts will be created in the `client-dist` and `server-dist` directories.

```sh
npm install
npm run build
```

## Serve

See `PORT` in `.env` file to configure the server port.

```sh
node server-dist
```

## Contributing

Pull requests are welcomed. All contributions must be licensed with the MIT license.

## License

    The MIT License (MIT)

    Copyright © 2023 Nathanael S. Ferrero

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
