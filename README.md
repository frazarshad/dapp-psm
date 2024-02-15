# dapp-psm

UI for Inter Protocol PSM

## Development

`yarn dev` to start a local HMR server.

By default it it will connect to the prod Wallet UI. To connect to a local one, use
http://127.0.0.1:5173/?wallet=local .

## Contributing

For bugs and feature requests, open a [new issue](https://github.com/Agoric/dapp-psm/issues/new).

For PRs, develop against the [main](https://github.com/Agoric/dapp-psm/tree/main) branch.

## Deployment

http://psm.inter.trade serves the latest build of the `beta` branch.

To deploy, push to that branch. e.g. if you've qualified main,

```
git push origin main:beta
```

## Notices

To display a notice banner in the app, in the network-config (e.g. https://main.agoric.net/network-config), add an entry to `notices` as demonstrated:

```json
{
...
  "notices": [
    {
      "start": "2020-01-01",
      "end": "2040-01-01",
      "message": "Hello world"
    }
  ]
}
```
