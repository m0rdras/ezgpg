# ezgpg ![](https://github.com/m0rdras/ezgpg/workflows/CI/badge.svg) [![codecov](https://codecov.io/gh/m0rdras/ezgpg/branch/master/graph/badge.svg)](https://codecov.io/gh/m0rdras/ezgpg)

A small Electron app for easy encryption/decryption of text messages via [GnuPG](https://www.gnupg.org).

# Getting Started

At the moment there is only a macOS package. Contribution builds for win32/Linux would be much appreciated. The project has been bootstrapped via [Electron Forge](https://www.electronforge.io), so packaging should be easy.

# Prerequisites

You will need to have GnuPG installed. Right now ezgpg is looking for a `gpg` executable in `/usr/local/bin` and `/usr/bin` in that order. Offering an easy way to configure the gpg path is planned.

# Running from Source

Install dependencies with [`yarn`](https://yarnpkg.com/) or `npm` and start with `yarn dev` or `yarn start`.

Run tests with `yarn test`.
