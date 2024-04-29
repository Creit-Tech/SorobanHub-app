# SorobanHub

SorobanHub is a desktop app that helps you manage and monitor your Soroban contracts, removing the need to use scripts or the terminal and instead interact with them using a simple UI.

> This app is still in early development, bugs and uncompleted functionalities are expected.

## How to run the app

If you want to use the app without directly from the source, you can do it with the help of `pnpm` and `make`. Here are the steps:

#### Download the source code
```shell
git clone git@github.com:Creit-Tech/SorobanHub-app.git
```

#### Install the dependencies
```shell
pnpm i
```

#### Build the backend files
```shell
make build-front
make build-back
make start-desktop
```

## Config files

The app will save the configuration files at `~/.SorobanHub`, if you want to re-start the whole app you can remove this folder

