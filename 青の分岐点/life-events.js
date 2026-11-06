/* 青の分岐点：人生イベント追加パック
 * index.html・画面レイアウト・既存の進行処理には触れず、
 * stepYearAll の結果が空の年にだけ追加イベントを返す独立アドオン。
 * 読み込み方法：ゲーム本体から独立した script として読み込む必要があります。
 */
(function () {
  "use strict";
  if (typeof window === "undefined" || typeof window.stepYearAll !== "function") return;
  if (window.__knotLifeEventsInstalled) return;
  window.__knotLifeEventsInstalled = true;

  const originalStep = window.stepYearAll;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const getState = (life) => {
    life.lifeEvents ||= { seen: [], memories: [], traits: {}, counters: {} };
    const e = life.lifeEvents;
    if (!Array.isArray(e.seen)) e.seen = [];
    if (!Array.isArray(e.memories)) e.memories = [];
    e.traits ||= {};
    e.counters ||= {};
    return e;
  };
  const remember = (life, event, choice) => {
    const e = getState(life);
    e.memories.push({ age: life.age, title: event.title, choice: choice.t });
    if (e.memories.length > 100) e.memories.shift();
    if (typeof log === "function") log(life, "【人生の出来事】" + event.title + "「" + choice.t + "」", "note");
  };
  const adjust = (life, key, amount) => {
    if (!amount) return;
    if (typeof add === "function") add(life, key, amount);
    else if (life.st && Number.isFinite(life.st[key])) life.st[key] = clamp(life.st[key] + amount, 0, 100);
  };
  const once = (life, id, title, text, choices) => {
    const e = getState(life);
    if (e.seen.includes(id)) return null;
    e.seen.push(id);
    return {
      always: 1, title, text,
      opts: choices.map((c) => ({
        t: c.t, s: c.s || "", w: c.w || 1,
        f: function () {
          if (c.effect) c.effect(life, e);
          remember(life, { title }, c);
          return null;
        }
      }))
    };
  };
  const has = (life, ...keys) => keys.some((k) => !!(life.flags && life.flags[k]));
  const events = [
    // 0–5歳
    { id: "family-trip", min: 1, max: 5, p: .13, title: "家族で初めての遠出", text: "家族で少し遠くまで出かけることになった。初めて見る景色に、胸が弾む。", choices: [
      { t: "いろいろな景色を見る", s: "好奇心いっぱいに周りを眺める", effect: (l,e)=>{e.traits.curious=true;adjust(l,"j",2);} },
      { t: "家族とたくさん写真を撮る", s: "思い出を形に残す", effect: (l,e)=>{e.counters.family=(e.counters.family||0)+1;adjust(l,"r",1);} },
      { t: "慣れた場所でゆっくり過ごす", s: "自分のペースを大切にする", effect: l=>adjust(l,"j",1) }
    ]},
    { id: "first-lesson", min: 3, max: 6, p: .12, title: "初めての習い事", text: "家族から、何か習い事を始めてみないかと提案された。", choices: [
      { t: "興味のあることに挑戦する", effect: (l,e)=>{e.traits.challenger=true;adjust(l,"h",1);} },
      { t: "友だちと一緒なら始める", effect: l=>adjust(l,"r",2) },
      { t: "今は始めない", effect: l=>adjust(l,"j",1) }
    ]},
    { id: "moving-house", min: 2, max: 10, p: .055, title: "引っ越しの話", text: "家族の事情で、住む場所が変わるかもしれない。", choices: [
      { t: "新しい場所を楽しみにする", effect: (l,e)=>{e.traits.adaptable=true;adjust(l,"j",2);} },
      { t: "今の友だちとのつながりを大切にする", effect: l=>adjust(l,"r",3) },
      { t: "不安な気持ちを家族に話す", effect: l=>adjust(l,"j",1) }
    ]},
    // 6–12歳
    { id: "school-friend", min: 6, max: 12, p: .16, title: "新しい友だち", text: "休み時間、まだあまり話したことのないクラスメイトが一人でいる。", choices: [
      { t: "自分から話しかける", effect: (l,e)=>{e.traits.outgoing=true;adjust(l,"r",3);} },
      { t: "共通の話題を探してみる", effect: l=>adjust(l,"r",2) },
      { t: "まずは様子を見る", effect: l=>adjust(l,"j",1) }
    ]},
    { id: "school-prize", min: 7, max: 12, p: .12, title: "得意なことを発見", text: "授業や遊びの中で、自分が得意かもしれないことに気づいた。", choices: [
      { t: "もっと練習してみる", effect: (l,e)=>{e.traits.persistent=true;adjust(l,"h",2);} },
      { t: "友だちに教えてみる", effect: l=>adjust(l,"r",2) },
      { t: "ほかのことにも挑戦する", effect: (l,e)=>{e.traits.curious=true;adjust(l,"j",1);} }
    ]},
    // 13–18歳
    { id: "club-choice", min: 13, max: 18, p: .13, title: "部活動の選択", text: "新しい学年になり、部活動や課外活動をどうするか考える時期になった。", choices: [
      { t: "興味のある活動に入る", effect: (l,e)=>{e.traits.teamwork=true;adjust(l,"r",2);adjust(l,"h",1);} },
      { t: "見学してから決める", effect: l=>adjust(l,"j",1) },
      { t: "勉強や自分の時間を優先する", effect: l=>adjust(l,"h",1) }
    ]},
    { id: "exam-pressure", min: 14, max: 18, p: .12, title: "進路への迷い", text: "周りが進路を決め始め、自分も将来について考えるようになった。", choices: [
      { t: "先生や家族に相談する", effect: l=>adjust(l,"r",2) },
      { t: "興味のある分野を調べる", effect: (l,e)=>{e.traits.curious=true;adjust(l,"h",2);} },
      { t: "焦らず、今できることを続ける", effect: l=>adjust(l,"j",1) }
    ]},
    { id: "school-festival", min: 13, max: 18, p: .13, title: "学校行事の準備", text: "クラスで行事の企画を決めることになった。", choices: [
      { t: "企画の中心になって動く", effect: l=>adjust(l,"r",3) },
      { t: "裏方として支える", effect: l=>adjust(l,"r",2) },
      { t: "自分のペースで参加する", effect: l=>adjust(l,"j",1) }
    ]},
    { id: "first-part-time", min: 16, max: 18, p: .07, title: "アルバイトへの興味", text: "同年代の知り合いがアルバイトを始めた。自分も働いてみようか。", choices: [
      { t: "条件を確認して挑戦する", effect: (l,e)=>{e.traits.independent=true;adjust(l,"h",1);} },
      { t: "学業や活動を優先する", effect: l=>adjust(l,"h",1) },
      { t: "もう少し考える", effect: l=>adjust(l,"j",1) }
    ]},
    // 19–24歳
    { id: "new-community", min: 19, max: 24, p: .14, title: "新しい居場所", text: "学校や職場、地域で新しい人たちと知り合う機会ができた。", choices: [
      { t: "自分から交流を広げる", effect: l=>adjust(l,"r",3) },
      { t: "気の合う人と少しずつ仲良くなる", effect: l=>adjust(l,"r",2) },
      { t: "ひとりの時間も大切にする", effect: l=>adjust(l,"j",1) }
    ]},
    { id: "travel-chance", min: 18, max: 29, p: .09, title: "旅に出るチャンス", text: "まとまった休みが取れそうだ。以前から気になっていた場所へ行けるかもしれない。", choices: [
      { t: "計画を立てて出かける", effect: (l,e)=>{e.memories.push({age:l.age,title:"旅の思い出",choice:"知らない土地を訪れた"});adjust(l,"j",3);} },
      { t: "近場で小さな旅を楽しむ", effect: l=>adjust(l,"j",2) },
      { t: "今回は貯蓄や準備を優先する", effect: l=>adjust(l,"h",1) }
    ]},
    // 25–39歳
    { id: "career-turn", min: 25, max: 39, p: .12, title: "仕事の転機", text: "仕事で新しい役割を任される話が出てきた。責任は増えるが、成長の機会でもある。", choices: [
      { t: "思い切って引き受ける", effect: (l,e)=>{e.traits.challenger=true;adjust(l,"h",2);} },
      { t: "条件や負担を相談する", effect: l=>adjust(l,"j",2) },
      { t: "今の役割を深める", effect: l=>adjust(l,"h",1) }
    ]},
    { id: "side-project", min: 25, max: 45, p: .075, title: "新しい挑戦の誘い", text: "仕事以外にも、以前から興味のあった活動を始める機会が訪れた。", choices: [
      { t: "小さく始めてみる", effect: (l,e)=>{e.traits.creator=true;adjust(l,"j",2);} },
      { t: "仲間を探して一緒に始める", effect: l=>adjust(l,"r",2) },
      { t: "今は本業に集中する", effect: l=>adjust(l,"h",1) }
    ]},
    { id: "home-decision", min: 28, max: 45, p: .06, title: "住まいを考える", text: "これからの暮らしを考え、住む場所や住まい方を見直すことにした。", choices: [
      { t: "情報を集めて慎重に検討する", effect: l=>adjust(l,"h",1) },
      { t: "家族や身近な人と相談する", effect: l=>adjust(l,"r",2) },
      { t: "今の暮らしを続ける", effect: l=>adjust(l,"j",1) }
    ]},
    // 40–64歳
    { id: "career-review", min: 40, max: 64, p: .12, title: "これからの働き方", text: "仕事や生活の優先順位を見直したくなってきた。", choices: [
      { t: "新しい役割に挑戦する", effect: l=>adjust(l,"h",2) },
      { t: "働き方を調整する", effect: l=>adjust(l,"j",2) },
      { t: "後輩の成長を支える", effect: l=>adjust(l,"r",2) }
    ]},
    { id: "old-hobby", min: 40, max: 64, p: .09, title: "昔好きだったこと", text: "若い頃に好きだった趣味を、もう一度始めてみたくなった。", choices: [
      { t: "道具をそろえて再開する", effect: l=>adjust(l,"j",3) },
      { t: "仲間を誘ってみる", effect: l=>adjust(l,"r",2) },
      { t: "まずは少しだけ試す", effect: l=>adjust(l,"j",1) }
    ]},
    { id: "family-support", min: 45, max: 69, p: .08, title: "家族との時間", text: "家族とゆっくり話す時間を作れそうだ。", choices: [
      { t: "一緒に出かける計画を立てる", effect: l=>adjust(l,"r",3) },
      { t: "近況をじっくり聞く", effect: l=>adjust(l,"r",2) },
      { t: "それぞれの時間も尊重する", effect: l=>adjust(l,"j",1) }
    ]},
    // 65歳以降
    { id: "retirement", min: 60, max: 75, p: .14, title: "これからの毎日", text: "仕事中心だった生活に、少しずつ自由な時間が増えてきた。", choices: [
      { t: "地域や趣味の活動に参加する", effect: l=>adjust(l,"r",2) },
      { t: "学び直しを始める", effect: l=>adjust(l,"h",1) },
      { t: "ゆっくり休む時間を作る", effect: l=>adjust(l,"j",2) }
    ]},
    { id: "new-hobby", min: 65, max: 100, p: .12, title: "新しい趣味との出会い", text: "近所や知人を通じて、初めての趣味を知った。", choices: [
      { t: "体験会に参加する", effect: l=>adjust(l,"j",2) },
      { t: "詳しい人に教わる", effect: l=>adjust(l,"r",2) },
      { t: "自分で調べて試してみる", effect: l=>adjust(l,"h",1) }
    ]},
    { id: "life-reflection", min: 70, max: 110, p: .10, title: "人生を振り返る", text: "ふと、これまで歩んできた道を振り返る時間ができた。", choices: [
      { t: "大切な人に感謝を伝える", effect: l=>adjust(l,"r",3) },
      { t: "思い出を記録に残す", effect: l=>adjust(l,"j",2) },
      { t: "これからやりたいことを考える", effect: l=>adjust(l,"j",2) }
    ]},
    // 年齢を問わない低確率イベント
    { id: "unexpected-kindness", min: 6, max: 100, p: .018, rare: true, title: "思いがけない親切", text: "困っていたとき、見知らぬ人がさりげなく助けてくれた。", choices: [
      { t: "丁寧にお礼を伝える", effect: l=>adjust(l,"r",3) },
      { t: "いつか自分も誰かを助けようと思う", effect: (l,e)=>{e.traits.kind=true;adjust(l,"j",2);} }
    ]},
    { id: "old-connection", min: 18, max: 100, p: .012, rare: true, title: "懐かしい人との再会", text: "長い間会っていなかった人と、偶然再会した。", choices: [
      { t: "近況を語り合う", effect: l=>adjust(l,"r",3) },
      { t: "また会う約束をする", effect: l=>adjust(l,"r",2) },
      { t: "心の中で再会を喜ぶ", effect: l=>adjust(l,"j",2) }
    ]}
  ];

  window.stepYearAll = function (life) {
    const existing = originalStep.apply(this, arguments);
    if (existing || !life || !life.alive || !Number.isFinite(life.age)) return existing;
    const state = getState(life);
    const age = life.age;
    const candidates = events.filter(ev =>
      age >= ev.min && age <= ev.max &&
      !state.seen.includes(ev.id) &&
      Math.random() < ev.p
    );
    if (!candidates.length) return null;
    // 通常イベントよりレアイベントを優先しすぎず、候補から1件だけ選ぶ。
    const event = candidates[Math.floor(Math.random() * candidates.length)];
    return once(life, event.id, event.title, event.text, event.choices);
  };
})();
