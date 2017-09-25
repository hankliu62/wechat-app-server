const Router = require('koa-router');
const request = require('request');
const pinyin = require('pinyin');
const sortBy = require('lodash/sortBy');
const cloneDeep = require('lodash/cloneDeep');

const Constant = require('../constants/wechat');

const router = new Router({prefix: '/v1/api/wechat'});

const getItemValue = (item, keys) => {
  for(const key of keys) {
    if (item[key]) {
      return item[key];
    }
  }

  return '';
}

const generatePinyinInitial = (items, keys, supplement) => {
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

    if (supplement && typeof(supplement) === 'function') {
      supplement(item)
    }
  }

  return items;
}

const getChats = () => {
  const chats = require('../data/data-chats.json') || [];
  return chats;
}

router.get('/chats', (ctx) => {
  const chats = getChats();
  const groups = getGroups();
  const contacts = getContacts();
  const officialAccounts = getOfficialAccounts();

  for (const chat of chats) {
    let baseResources = [];
    let chatMemberResources = [];
    switch (chat.base.type) {
      case Constant.CHAT_ROOM_TYPE_FRIENDS: {
        baseResources = contacts;
        chatMemberResources = contacts;
        break;
      }
      case Constant.CHAT_ROOM_TYPE_GROUP: {
        baseResources = groups;
        chatMemberResources = contacts;
        break;
      }
      case Constant.CHAT_ROOM_TYPE_SERVICE: {
        baseResources = officialAccounts;
        chatMemberResources = officialAccounts;
        break;
      }
    }

    const base = baseResources.find(item => item.wxid === chat.base.wxid) || {};
    chat.base = Object.assign({}, cloneDeep(base), cloneDeep(chat.base));

    if (chat.base.type === Constant.CHAT_ROOM_TYPE_FRIENDS) {
      chat.base.name = chat.base.remark || chat.base.nickname;
    }

    if (chat.base.type === Constant.CHAT_ROOM_TYPE_SERVICE) {
      const chatDialogues = (chat.chatDialogueModel || []).map((wxid) => {
        const officialAccount = chatMemberResources.find(item => item.wxid === wxid) || {};
        return Object.assign({ wxid }, cloneDeep(officialAccount));
      });
      chat.chatDialogueModel = chatDialogues;
    } else {
      const chatMembers = (chat.chatMemberModel || []).map((wxid) => {
        const member = chatMemberResources.find(item => item.wxid === wxid) || {};
        return Object.assign({ wxid }, cloneDeep(member));
      });
      chat.chatMemberModel = chatMembers;
    }

  }

  const sortedChats = sortBy(chats, (item) => -item.chatBaseModel.endTimeStr);

  ctx.body = {
    status: 200,
    data: {
      items: sortedChats
    }
  };
});

const getContacts = () => {
  const contacts = require('../data/data-contacts.json');
  return generatePinyinInitial(contacts, ['remark', 'nickname'], (item) => {
    item.gender = item.sex === 1 ? Constant.MALE : Constant.FEMALE;
  });
}

router.get('/contacts', (ctx) => {
  const contacts = getContacts();
  ctx.body = {
    status: 200,
    data: {
      items: contacts
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
  const groups = require('../data/data-groups.json');
  return groups;
}

router.get('/groups', (ctx) => {
  const groups = getGroups();
  ctx.body = {
    status: 200,
    data: {
      items: groups
    }
  };
});

const getMoments = () => {
  const moments = require('../data/data-moments.json');
  return moments;
}

router.get('/moments', (ctx) => {
  const moments = getMoments();
  ctx.body = {
    status: 200,
    data: {
      items: moments
    }
  };
});

router.get('/moments/:wxid', (ctx) => {
  const moments = getMoments() || [];
  const moment = moments.find(item => item.wxid === ctx.params.wxid);
  ctx.body = {
    status: 200,
    data: {
      moment
    }
  };
});

const getNewFriends = () => {
  const newFriends = require('../data/data-new-friends.json');
  return newFriends;
}

router.get('/new-friends', (ctx) => {
  const newFriends = getNewFriends();
  ctx.body = {
    status: 200,
    data: {
      items: newFriends
    }
  };
});

const getOfficialAccounts = () => {
  const officialAccounts = require('../data/data-official-accounts.json');
  return generatePinyinInitial(officialAccounts, ['name']);
}

router.get('/official-accounts', (ctx) => {
  const officialAccounts = getOfficialAccounts();
  ctx.body = {
    status: 200,
    data: {
      items: officialAccounts
    }
  };
});

const getSelf = () => {
  const personal = require('../data/data-self.json');
  personal.gender = personal.sex === 1 ? Constant.MALE : Constant.FEMALE;
  return personal;
}

router.get('/self', (ctx) => {
  const personal = getSelf();
  ctx.body = {
    status: 200,
    data: {
      item: personal
    }
  };
});

module.exports = router;
