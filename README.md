## Architecture

![](https://files.tzwm.me/images/2023/01/20230117202155.webp)

## Tips

### export all env variables

`export $(grep -v '^#' .env | xargs)`

## TODO

- [ ] Add README.md and other documents
- [x] Add Docker support
- [x] Move `dreamily-api` to NPM library
- [ ] Add sqlite to save and load all conversions from DB
- [ ] Add new Discord messenger
