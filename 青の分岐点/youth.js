/* 青の分岐点：青春イベント追加パック
 * 既存の進行関数・画面構造・データを置き換えず、イベントを追加するだけ。
 */
(function(){
  "use strict";
  if (typeof window.stepYearAll !== "function" || typeof window.render !== "function") return;
  const baseStep = window.stepYearAll;
  const baseRender = window.render;

  function state(L){
    if(!L.youth || typeof L.youth!=="object"){
      L.youth={score:0,friendship:0,memories:[],seen:[],crush:false,club:false};
    }
    const Y=L.youth;
    if(!Array.isArray(Y.memories))Y.memories=[];
    if(!Array.isArray(Y.seen))Y.seen=[];
    return Y;
  }
  function remember(L,Y,text,delta,kind){
    Y.score=Math.max(0,Math.min(100,(Y.score||0)+delta));
    Y.memories.push({age:L.age,text:text,kind:kind||"memory"});
    if(Y.memories.length>40)Y.memories.shift();
    if(typeof log==="function")log(L,"【青春の思い出】"+text,"note");
  }
  function addSocial(L,n){
    if(typeof add==="function")add(L,"r",n);
    else if(L.st)L.st.r=Math.max(0,Math.min(100,(L.st.r||0)+n));
  }
  function makeDecision(L,Y,key,title,text,choices){
    if(Y.seen.includes(key))return null;
    Y.seen.push(key);
    return {
      always:1,
      title:title,
      text:text,
      opts:choices.map(c=>({
        t:c.t,s:c.s||"",w:1,
        f:function(){
          if(c.effect)c.effect();
          remember(L,Y,c.memory||c.t,c.delta||0,c.kind||"memory");
          return null;
        }
      }))
    };
  }
  function eventFor(L){
    if(!L || !L.alive || L.age<6 || L.age>22 || typeof R!=="function")return null;
    const Y=state(L), age=L.age;
    if(Y.seen.includes("year-"+age))return null;
    // 学校に通っている可能性が高い年代に限定。高校・大学の在籍を勝手に作らない。
    const elementary=age>=6&&age<=12;
    const middle=age>=13&&age<=15;
    const high=age>=16&&age<=18&&!!L.hs;
    const college=age>=19&&age<=22&&!!(L.univ||L.edu==="専門");
    if(!(elementary||middle||high||college))return null;
    // 既存イベントが少ない年に、青春イベントを追加する。
    if(R()>(age<=12?.62:.78))return null;
    Y.seen.push("year-"+age);
    const r=R();
    if(elementary){
      if(r<.34)return makeDecision(L,Y,"child-friend-"+age,"放課後、友だちに「もう少し遊んでいこう」と誘われた。","夕方のチャイムが鳴るまで、何をして過ごそう。",[
        {t:"みんなと遊ぶ",s:"帰る時間を忘れて夢中になる",delta:7,effect:()=>{Y.friendship++;addSocial(L,3)},memory:"放課後、友だちと時間を忘れて遊んだ。"},
        {t:"一緒に帰る",s:"帰り道でゆっくり話す",delta:5,effect:()=>addSocial(L,2),memory:"友だちと寄り道しながら帰った。"},
        {t:"今日は先に帰る",s:"家で自分の時間を過ごす",delta:1,memory:"友だちに手を振って、ひとりで帰った。"}
      ]);
      if(r<.67)return makeDecision(L,Y,"child-festival-"+age,"学校で季節の行事がある。","クラスのみんなと、どんなふうに参加しよう。",[
        {t:"準備を手伝う",delta:6,effect:()=>addSocial(L,2),memory:"行事の準備をみんなで頑張った。"},
        {t:"本番を思いきり楽しむ",delta:7,memory:"学校の行事で、思いきり笑った。"},
        {t:"自分のペースで参加する",delta:3,memory:"自分らしい距離感で行事を楽しんだ。"}
      ]);
      return makeDecision(L,Y,"child-memory-"+age,"帰り道、空がきれいに見えた。","何気ない一日だけど、少しだけ覚えておきたい気がした。",[
        {t:"友だちと写真を撮る",delta:5,memory:"帰り道の景色を、友だちと写真に残した。"},
        {t:"景色を眺めて帰る",delta:4,memory:"夕焼けを眺めながら、ゆっくり帰った。"}
      ]);
    }
    if(middle||high){
      if(r<.24)return makeDecision(L,Y,"club-"+age,"部活動の仲間から、練習後に声をかけられた。","大会に向けて、もう少し一緒に頑張ってみないか。",[
        {t:"最後まで本気で取り組む",delta:8,effect:()=>{Y.club=true;addSocial(L,3);if(L.st)L.st.h=Math.min(100,L.st.h+1)},memory:"部活動の仲間と、最後まで練習に打ち込んだ。"},
        {t:"無理のない範囲で続ける",delta:5,effect:()=>{Y.club=true;addSocial(L,2)},memory:"自分のペースで部活動を続けた。"},
        {t:"別のことに時間を使う",delta:2,memory:"部活動以外にも、自分の居場所を見つけた。"}
      ]);
      if(r<.47)return makeDecision(L,Y,"festival-"+age,"文化祭の準備が始まった。","クラスで役割を決めることになった。",[
        {t:"企画の中心になって動く",delta:9,effect:()=>addSocial(L,4),memory:"文化祭の企画を仲間と一緒に作り上げた。"},
        {t:"装飾や裏方を担当する",delta:7,effect:()=>addSocial(L,2),memory:"文化祭の裏側を支え、みんなで成功させた。"},
        {t:"当日を楽しむ側に回る",delta:5,memory:"文化祭で、忘れられない一日を過ごした。"}
      ]);
      if(r<.68)return makeDecision(L,Y,"friend-"+age,"最近、よく話すクラスメイトがいる。","帰り道に「今度の休み、どこか行かない？」と誘われた。",[
        {t:"一緒に出かける",delta:8,effect:()=>{Y.friendship++;addSocial(L,4)},memory:"友だちと出かけて、帰りたくないほど楽しかった。"},
        {t:"学校でまた話そうと伝える",delta:5,effect:()=>addSocial(L,2),memory:"友だちとの距離が、少し近くなった。"},
        {t:"今回は断る",delta:1,memory:"自分の時間も大切にしようと思った。"}
      ]);
      if(age>=15&&!Y.crush&&!L.partner&&!L.married&&r<.88)return makeDecision(L,Y,"first-crush-"+age,"文化祭の帰り、気になっていた人と二人きりになった。","言いたいことはあるのに、なかなか言葉が出てこない。",[
        {t:"思い切って気持ちを伝える",delta:8,effect:()=>{Y.crush=true;addSocial(L,3)},memory:"勇気を出して、自分の気持ちを伝えた。"},
        {t:"もう少し相手を知ってから",delta:5,memory:"焦らず、相手のことをもっと知ろうと思った。"},
        {t:"今は友だちとして過ごす",delta:3,memory:"今の関係を大切にすることにした。"}
      ]);
      if(age===15||age===18)return makeDecision(L,Y,"school-farewell-"+age,"卒業が近づき、いつもの教室が少し違って見える。","当たり前だと思っていた毎日にも、終わりが来る。",[
        {t:"友だちと写真を撮る",delta:9,effect:()=>addSocial(L,3),memory:"卒業前、友だちとたくさん写真を撮った。"},
        {t:"先生に感謝を伝える",delta:7,memory:"お世話になった先生に、ありがとうを伝えた。"},
        {t:"いつもの仲間と最後まで過ごす",delta:8,memory:"最後の日まで、いつもの仲間と笑って過ごした。"}
      ]);
      return makeDecision(L,Y,"school-trip-"+age,"学校行事の自由時間。","友だちと過ごせる、少し特別な時間ができた。",[
        {t:"みんなで観光する",delta:7,effect:()=>addSocial(L,3),memory:"友だちと知らない景色を見て回った。"},
        {t:"気の合う一人と話す",delta:8,effect:()=>addSocial(L,3),memory:"友だちと夜遅くまで、いろいろな話をした。"},
        {t:"ひとりで好きな場所を巡る",delta:4,memory:"自分のペースで、旅先の景色を楽しんだ。"}
      ]);
    }
    if(college){
      if(r<.35)return makeDecision(L,Y,"college-festival-"+age,"大学・専門学校の学園祭が近づいている。","サークルや友人たちと、どう過ごそう。",[
        {t:"企画や運営に参加する",delta:8,effect:()=>addSocial(L,3),memory:"仲間と学園祭を作り上げた。"},
        {t:"友人と屋台や展示を回る",delta:7,effect:()=>addSocial(L,2),memory:"友人と学園祭を一日中楽しんだ。"},
        {t:"興味のある展示をじっくり見る",delta:5,memory:"新しい世界に触れた学園祭だった。"}
      ]);
      return makeDecision(L,Y,"college-friend-"+age,"友人から、授業のあとに遊びに行こうと誘われた。","忙しい毎日の中で、久しぶりに予定のない時間ができた。",[
        {t:"一緒に出かける",delta:7,effect:()=>{Y.friendship++;addSocial(L,3)},memory:"友人と夜まで語り合った。"},
        {t:"課題を終わらせてから合流する",delta:6,memory:"やることを終えてから、友人との時間を楽しんだ。"},
        {t:"今日は自分の時間にする",delta:3,memory:"ひとりで過ごす時間も大切にした。"}
      ]);
    }
    return null;
  }

  window.stepYearAll=function(L){
    const d=baseStep.call(this,L);
    if(!L||!L.alive)return d;
    state(L);
    if(d)return d;
    return eventFor(L);
  };
  window.render=function(){
    baseRender.apply(this,arguments);
    try{
      const L=typeof S!=="undefined"&&S?S.L:null;
      const el=document.querySelector("#miniStats");
      if(!L||!el)return;
      const Y=state(L);
      if(!el.querySelector("[data-youth-stat]")){
        const span=document.createElement("span");
        span.dataset.youthStat="1";
        span.innerHTML='青春 <b class="num"></b>';
        el.appendChild(span);
      }
      el.querySelector("[data-youth-stat] b").textContent=Math.round(Y.score||0);
      // 思い出アルバムは既存の「人生の記録」カード内に折りたたんで追加する。
      const logBox=document.querySelector(".logsheet");
      if(logBox){
        let album=document.querySelector("#youthAlbum");
        if(Y.memories.length){
          if(!album){
            album=document.createElement("details");
            album.id="youthAlbum";
            album.style.cssText="margin-top:12px;border-top:1px solid var(--rule);padding-top:10px";
            const summary=document.createElement("summary");
            summary.style.cssText="cursor:pointer;font-weight:700";
            album.appendChild(summary);
            const list=document.createElement("div");
            list.id="youthAlbumList";
            list.style.cssText="display:grid;gap:7px;margin-top:10px";
            album.appendChild(list);
            const log=document.querySelector("#log");
            if(log)log.insertAdjacentElement("afterend",album);
            else logBox.appendChild(album);
          }
          album.querySelector("summary").textContent="青春の思い出アルバム（"+Y.memories.length+"）";
          const list=album.querySelector("#youthAlbumList");
          list.replaceChildren();
          Y.memories.slice().reverse().forEach(m=>{
            const item=document.createElement("div");
            item.style.cssText="font-size:13px;padding:6px 0;border-bottom:1px dashed var(--rule)";
            item.textContent=m.age+"歳　"+m.text;
            list.appendChild(item);
          });
        }else if(album)album.remove();
      }
    }catch(e){}
  };
})();