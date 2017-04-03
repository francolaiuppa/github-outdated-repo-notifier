# Github Outdated Repo Notifier
This repo allows you to setup a daily notification for all your out of date Github repos.
The amount of days required to consider a repo out of date is configurable.

# Setup
Create a webtask based on the [index.js](https://raw.github.com/francolaiuppa/github-outdated-repo-notifier/index.js) file. Configure the following secrets:
- TELEGRAM_TOKEN
- TELEGRAM_CHAT_ID (you can get this using [this example](https://github.com/yagop/node-telegram-bot-api))
- GITHUB_USERNAME

# More info
Please see the blog post at francolaiuppa.com
