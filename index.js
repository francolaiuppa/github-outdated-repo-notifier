const request = require('request@2.67.0');
const moment = require('moment@2.11.2');
const TelegramBot = require('node-telegram-bot-api@0.21.1');
const OUTDATED_DAYS = 10;
const IGNORE_DESCRIPTION_MATCHING = ['\[DEPRECATED\]'];
const IGNORE_NAME_MATCHING = ['demo','example'];

function isOutdated(days) {
  return (days >= OUTDATED_DAYS) ? true : false;
}

function hasMatchingPattern(search,pattern) {
  return (search.indexOf(pattern) === -1) ? false : true;
}

function containsOnlyFalseValues(element) {
  return (element === false);
}

function hasMatchingPatterns(repo) {
  var results = IGNORE_NAME_MATCHING.map(function(pattern){
    return hasMatchingPattern(repo.name,pattern);
  });
  if (!results.every(containsOnlyFalseValues)) { return true; }

  results = IGNORE_DESCRIPTION_MATCHING.map(function(pattern){
    return hasMatchingPattern(repo.description,pattern);
  });
  if (!results.every(containsOnlyFalseValues)) { return true; }
  return false;
}

function filterOutdatedRepos(data) {
  var outdatedRepos = [];
  data.forEach(function(repo) {
    var now = moment(new Date());
    var end = moment(repo.updated_at);
    var duration = moment.duration(now.diff(end));
    var days = duration.asDays();
    if (!repo.description) { repo.description = ''; }
    if (isOutdated(days) && !hasMatchingPatterns(repo)) {
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
  const MESSAGE_NOT_UP_TO_DATE = 'You have repos that haven\'t been updated in the last *'+OUTDATED_DAYS+'* or more days.\nPlease add `\[DEPRECATED\]` to the repo(s) description if you aren\'t maintaining them anymore. \n';
  if (outdatedRepos.length === 0) { return MESSAGE_UP_TO_DATE; }
  var message = MESSAGE_NOT_UP_TO_DATE;
  outdatedRepos.forEach(function(repo) {
    message += '\n ['+repo.name+']('+repo.url+') *'+parseInt(repo.outdatedDays)+'* days ago.';
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
