const Router = require('koa-router');
const request = require('request');
const pinyin = require('pinyin');

const router = new Router({prefix: '/v1/api/wechat'});

const getItemValue = (item, keys) => {
  for(const key of keys) {
    if (item[key]) {
      return item[key];
    }
  }

  return '';
}

const generatePinyinInitial = (items, keys) => {
  const pinyinOptions = {
    heteronym: false,
    style: pinyin.STYLE_NORMAL // 设置拼音风格
  };

  for (const item of items) {
    item.initial = '';
    const pinyins = pinyin(getItemValue(item, keys), pinyinOptions);
    if (pinyins && pinyins.length) {
      if (pinyins[0] && pinyins[0].length && pinyins[0][0]) {
        if (/\w/.test(pinyins[0][0][0])) {
          item.initial = pinyins[0][0][0].toUpperCase();
        } else {
          item.initial = '#';
        }
      }
      item.pinyin = ([]).concat.call([], ...pinyins).join('');
    }
  }

  return items;
}

const getChats = () => {
  const chats = require('../constants/data-chats.json') || [];
  return chats;
}

router.get('/chats', (ctx) => {
  const chats = getChats();
  ctx.body = {
    status: 200,
    data: {
      items: chats,
    }
  };
});

const getContacts = () => {
  const contacts = require('../constants/data-contacts.json');
  return generatePinyinInitial(contacts, ['remark', 'nickname']);
}

router.get('/contacts', (ctx) => {
  const contacts = getContacts();
  ctx.body = {
    status: 200,
    data: {
      items: contacts,
    }
  };
});

router.get('/contacts/:wxid', (ctx) => {
  const contacts = getContacts();
  const constant = contacts.find(item => item.wxid === ctx.params.wxid);
  const status = constant ? 200 : 404;
  ctx.body = {
    status,
    data: { constant: constant || null }
  };
});

const getGroups = () => {
  const groups = require('../constants/data-groups.json');
  return groups;
}

router.get('/groups', (ctx) => {
  const groups = getGroups();
  ctx.body = {
    status: 200,
    data: {
      items: groups,
    }
  };
});

const getMoments = () => {
  const moments = require('../constants/data-moments.json');
  return moments;
}

router.get('/moments', (ctx) => {
  const moments = getMoments();
  ctx.body = {
    status: 200,
    data: {
      items: moments,
    }
  };
});

const getNewFriends = () => {
  const newFriends = require('../constants/data-new-friends.json');
  return newFriends;
}

router.get('/new-friends', (ctx) => {
  const newFriends = getNewFriends();
  ctx.body = {
    status: 200,
    data: {
      items: newFriends,
    }
  };
});

const getOfficialAccounts = () => {
  const officialAccounts = require('../constants/data-official-accounts.json');
  return officialAccounts;
}

router.get('/official-accounts', (ctx) => {
  const officialAccounts = getOfficialAccounts();
  ctx.body = {
    status: 200,
    data: {
      items: officialAccounts,
    }
  };
});

const getSelf = () => {
  const personal = require('../constants/data-self.json');
  return personal;
}

router.get('/self', (ctx) => {
  const personal = getSelf();
  ctx.body = {
    status: 200,
    data: {
      item: personal,
    }
  };
});

module.exports = router;
