const request = require('request@2.67.0');
const moment = require('moment@2.11.2');
const TelegramBot = require('node-telegram-bot-api@0.21.1');
const OUTDATED_DAYS = 10;

function filterOutdatedRepos(data) {
  var outdatedRepos = [];
  data.forEach(function(repo) {
    var now = moment(new Date());
    var end = moment(repo.updated_at);
    var duration = moment.duration(now.diff(end));
    var days = duration.asDays();
    if (days >= OUTDATED_DAYS) {
      outdatedRepos.push({
        name: repo.name,
        url: repo.html_url,
        outdatedDays: days
      });
    }
  });
  return outdatedRepos;
}

function getMessage(outdatedRepos) {
  const MESSAGE_UP_TO_DATE = 'All your repos have been updated in the last '+OUTDATED_DAYS+' days, good job!';
  const MESSAGE_NOT_UP_TO_DATE = 'You have repos that haven\'t been updated in the last '+OUTDATED_DAYS+' days';
  if (outdatedRepos.length === 0) { return MESSAGE_UP_TO_DATE; }
  var message = MESSAGE_NOT_UP_TO_DATE;
  outdatedRepos.forEach(function(repo) {
    message += '\n ['+repo.name+']('+repo.url+') hasn\'t received an update in '+parseInt(repo.outdatedDays)+' days.';
  });
  return message;
}

function handleRequest(err,body,cb) {
  if (err) { return cb(err); }
  try { var data = JSON.parse(body); }
  catch (e) { return cb(e); }
  return getMessage(filterOutdatedRepos(data));
}

function sendTelegramMessage(ctx,message,cb) {
  const TELEGRAM_TOKEN = ctx.secrets.TELEGRAM_TOKEN;
  const TELEGRAM_CHAT_ID = ctx.secrets.TELEGRAM_CHAT_ID;
  const bot = new TelegramBot(TELEGRAM_TOKEN, {polling: true});
  bot.sendMessage(TELEGRAM_CHAT_ID, message, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
  cb(null,true);
}

module.exports = function(ctx, cb) {
  const API_URL = 'https://api.github.com/users/'+ctx.secrets.GITHUB_USERNAME+'/repos?sort=updated&direction=asc';
  const REQUEST_OPTIONS = {
    url: API_URL,
    headers: {
      'User-Agent': ctx.secrets.GITHUB_USERNAME
    }
  };

  request.get(REQUEST_OPTIONS,function(err,msg,body) {
    var message = handleRequest(err,body,cb);
    sendTelegramMessage(ctx,message,cb);
  });
};
