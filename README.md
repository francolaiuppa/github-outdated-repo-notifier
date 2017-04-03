# Github Outdated Repo Notifier
Allows you to setup a daily Telegram notification for all your out of date Github repos.

The amount of days required to consider a repo out of date is configurable.

# Setup
1.Create a [webtask](https://webtask.io) based on the [index.js](https://raw.githubusercontent.com/francolaiuppa/github-outdated-repo-notifier/master/index.js) file.
2.Configure the following secrets:

- TELEGRAM_TOKEN
- TELEGRAM_CHAT_ID (Get it using [this example](https://github.com/yagop/node-telegram-bot-api))
- GITHUB_USERNAME

# More info
Please see the blog post at francolaiuppa.com
