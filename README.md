# ezgpg [![](https://github.com/m0rdras/ezgpg/workflows/CI/badge.svg)](https://github.com/m0rdras/ezgpg/actions?query=workflow%3ACI) [![codecov](https://codecov.io/gh/m0rdras/ezgpg/branch/master/graph/badge.svg)](https://codecov.io/gh/m0rdras/ezgpg)

A small Electron app for easy encryption/decryption of text messages via [GnuPG](https://www.gnupg.org). This is just a little fun project after discovering that there seems to be no 'beautiful' UI for gpg that non-technical users will not reject immediately. On top of that, most gpg UIs seem to be focused on email client integration.

The goal for ezgpg is to provide simple access to the most basic gpg functionality, like key management, encryption/decryption or signing.

# Prerequisites

As an Electron app, ezgpg should run on macOS/Linux/Windows. You will need to have a distribution of [GnuPG](https://www.gnupg.org) installed. On initial startup ezgpg is looking for a `gpg` executable in `/usr/local/bin` and `/usr/bin` in that order. The gpg binary file path can be configured on the Settings tab.

# Getting Started

There is a macOS ZIP package containing a full application bundle. Linux/Windows users will need to run from source or create their own package at the moment. The project has been bootstrapped via [Electron Forge](https://www.electronforge.io), so creating a new package should be fairly easy.

# Running from Source

Install dependencies with [`yarn`](https://yarnpkg.com/) or `npm` and start with `yarn dev` or `yarn start`.

Run tests with `yarn test`.
