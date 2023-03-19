## Architecture

![](https://files.tzwm.me/images/2023/01/20230117202155.webp)

## Tips

### export all env variables

`export $(grep -v '^#' .env | xargs)`

## TODO

- [ ] Add README.md and other documents
- [x] Add Docker support
- [x] Move `dreamily-api` to NPM library
- [ ] Add sqlite to store and load all conversions from DB
- [ ] Add new Discord messenger
- [ ] Support service start parameters like `--start-messenger larkbot --with-service chatgpt1`
- [ ] Add StableDiffusion WebUI service and add a mode about it
- [ ] Optimize Controller and Conversation class
- [ ] Optimize helper command by using config file
- [ ] Support reply image for all messengers
