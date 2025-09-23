/**
 * app.js
 * 功能：
 * 1. 根据配置渲染视频下方的问题与选项。
 * 2. 在指定时间显示问题（可选是否暂停视频）。
 * 3. 点击选项后跳转到对应时间并继续播放。
 */

(function () {
  // DOM 引用
  const video = document.getElementById('video');
  const qa = document.getElementById('qa-container');

  /**
   * 配置区：在此定义问题出现时间与各个选项的跳转秒数。
   * - time: 问题出现的时间（秒）
   * - pauseOnShow: 出现时是否暂停视频
   * - options: { label: 文本, jumpTo: 秒数 }
   *
   * 可根据你的内容自由增删问题；确保 id 唯一即可。
   */
  // 医疗就诊主题：根据视频章节锚点时间进行跳转
  // 建议将 jumpTo 替换为你视频真实的时间点（单位：秒）
  const questions = [
    {
      id: 'reg',
      time: 5, // 开场后 5s：讲完背景，提问下一步
      text: '你知道下一步是干什么吗？（到医院后首先要做什么）',
      pauseOnShow: true,
      options: [
        { label: '挂号/分诊', jumpTo: 10 }, // 挂号段落开始
        { label: '直接去诊室', jumpTo: 40 },
        { label: '去缴费窗口', jumpTo: 75 },
      ],
    },
    {
      id: 'wait',
      time: 35, // 挂号讲解后 35s：提问下一步
      text: '挂号完成后，下一步最好是？',
      pauseOnShow: true,
      options: [
        { label: '候诊等待叫号', jumpTo: 42 }, // 候诊段落开始
        { label: '直接做检查', jumpTo: 90 },
      ],
    },
    {
      id: 'pay',
      time: 85, // 问诊讲解后 85s：提问下一步
      text: '医生安排检查后，下一步应该？',
      pauseOnShow: true,
      options: [
        { label: '缴费并前往检查科室', jumpTo: 95 }, // 缴费与检查流程
        { label: '回家等待结果', jumpTo: 150 },
      ],
    },
    {
      id: 'review',
      time: 145, // 检查完成后 145s：提问下一步
      text: '检查完成拿到结果后，下一步？',
      pauseOnShow: true,
      options: [
        { label: '回到诊室复诊', jumpTo: 155 },
        { label: '直接去药房取药', jumpTo: 180 },
      ],
    },
    {
      id: 'pharmacy',
      time: 175, // 复诊讲解后 175s：提问下一步
      text: '医生开具处方后，下一步应该？',
      pauseOnShow: true,
      options: [
        { label: '缴费后去药房取药', jumpTo: 182 },
        { label: '结束就医流程', jumpTo: 210 },
      ],
    },
  ];

  // 渲染所有问题块（初始隐藏，由时间触发显示）
  const questionMap = new Map();
  for (const q of questions) {
    const card = document.createElement('section');
    card.className = 'question';
    card.id = q.id;
    card.setAttribute('data-appear-time', String(q.time));

    const title = document.createElement('h3');
    title.textContent = q.text;
    card.appendChild(title);

    const opts = document.createElement('div');
    opts.className = 'options';
    for (const opt of q.options) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = opt.label;
      btn.setAttribute('data-jump', String(opt.jumpTo));
      btn.addEventListener('click', () => {
        // 点击选项：跳转到目标时间并继续播放
        try {
          video.currentTime = Number(opt.jumpTo) || 0;
          video.play();
          // 如果需要点击后收起该问题卡片，可取消注释下一行
          // card.classList.remove('visible');
        } catch (err) {
          console.error('[jump error]', err);
        }
      });
      opts.appendChild(btn);
    }
    card.appendChild(opts);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = '出现时间：' + formatTime(q.time);
    card.appendChild(meta);

    qa.appendChild(card);
    questionMap.set(q.id, { cfg: q, el: card, shown: false });
  }

  // 监听播放进度：到时显示问题
  function onTimeUpdate() {
    const t = video.currentTime || 0;
    for (const { cfg, el, shown } of questionMap.values()) {
      if (!shown && t >= cfg.time) {
        el.classList.add('visible');
        // 标记为已显示，避免重复触发
        const entry = questionMap.get(cfg.id);
        if (entry) entry.shown = true;
        if (cfg.pauseOnShow) {
          video.pause();
        }
      }
    }
  }

  // 拖动进度条后：如果超过某些未显示的问题时间点，则显示它们
  function onSeeked() {
    const t = video.currentTime || 0;
    for (const entry of questionMap.values()) {
      if (!entry.shown && t >= entry.cfg.time) {
        entry.el.classList.add('visible');
        entry.shown = true;
      }
    }
  }

  video.addEventListener('timeupdate', onTimeUpdate);
  video.addEventListener('seeked', onSeeked);

  /**
   * 工具：将秒数转为 mm:ss
   */
  function formatTime(seconds) {
    const s = Math.floor(seconds % 60);
    const m = Math.floor(seconds / 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }
})();
