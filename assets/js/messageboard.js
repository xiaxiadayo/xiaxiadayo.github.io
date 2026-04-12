/**
 * Message Board – core logic
 * Supports Supabase (public persistence) or localStorage (single-device fallback).
 */
(function () {
  "use strict";

  /* ---------- Config ---------- */
  var CFG = window.MESSAGE_BOARD_CONFIG || {};
  var BACKEND = CFG.STORAGE_BACKEND || "local";
  var ADMIN_PWD = CFG.ADMIN_PASSWORD || "xiaxia";
  var LS_KEY = "mb_messages";
  var COLLAPSE_HEIGHT = 120;

  /* ---------- State ---------- */
  var allMessages = [];
  var currentPage = 1;
  var isAdmin = false;

  /* ---------- DOM refs ---------- */
  var form = document.getElementById("mbForm");
  var authorInput = document.getElementById("mbAuthor");
  var contentInput = document.getElementById("mbContent");
  var listEl = document.getElementById("mbList");
  var paginationEl = document.getElementById("mbPagination");
  var adminBtn = document.getElementById("mbAdminBtn");
  var adminStatus = document.getElementById("mbAdminStatus");
  var toastEl = document.getElementById("mbToast");
  var localWarning = document.getElementById("mbLocalWarning");

  /* ---------- Helpers ---------- */
  function isMobile() {
    return window.innerWidth <= 768;
  }

  function perPage() {
    return isMobile() ? 100 : 5;
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- Toast ---------- */
  var toastMessages = [
    "留言成功啦！谢谢你的分享～ 🎉",
    "耶！你的留言已经发出去啦～ ✨",
    "收到收到！留言已上墙～ 🥳",
    "太棒了！感谢你的留言～ 💫",
    "发送成功！期待更多精彩留言～ 🌟",
    "Bingo！留言发布成功～ 🎊",
    "你的留言已经安全送达！🚀",
    "哇～又多了一条新留言！🎈"
  ];

  function showToast() {
    var msg = toastMessages[Math.floor(Math.random() * toastMessages.length)];
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3000);
  }

  /* ---------- Storage abstraction ---------- */
  var Storage = {
    load: function () {
      if (BACKEND === "supabase") {
        return supabaseFetch("GET");
      }
      var raw = localStorage.getItem(LS_KEY);
      return Promise.resolve(raw ? JSON.parse(raw) : []);
    },

    add: function (msg) {
      if (BACKEND === "supabase") {
        return supabaseFetch("POST", msg);
      }
      var self = this;
      return self.load().then(function (list) {
        list.unshift(msg);
        localStorage.setItem(LS_KEY, JSON.stringify(list));
        return list;
      });
    },

    remove: function (id) {
      if (BACKEND === "supabase") {
        return supabaseFetch("DELETE", { id: id });
      }
      var self = this;
      return self.load().then(function (list) {
        list = list.filter(function (m) { return m.id !== id; });
        localStorage.setItem(LS_KEY, JSON.stringify(list));
        return list;
      });
    }
  };

  /* ---------- Supabase helpers ---------- */
  function supabaseFetch(method, body) {
    var url = CFG.SUPABASE_URL + "/rest/v1/messages";
    var headers = {
      "apikey": CFG.SUPABASE_ANON_KEY,
      "Authorization": "Bearer " + CFG.SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      "Prefer": ""
    };

    if (method === "GET") {
      headers["Prefer"] = "return=representation";
      return fetch(url + "?order=created_at.desc", { headers: headers })
        .then(function (resp) { return resp.json(); });
    }

    if (method === "POST") {
      headers["Prefer"] = "return=representation";
      return fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          author: body.author,
          content: body.content
        })
      }).then(function () {
        return supabaseFetch("GET");
      });
    }

    if (method === "DELETE") {
      return fetch(url + "?id=eq." + body.id, {
        method: "DELETE",
        headers: headers
      }).then(function () {
        return supabaseFetch("GET");
      });
    }

    return Promise.resolve([]);
  }

  /* ---------- Rendering ---------- */
  function renderMessages() {
    var total = allMessages.length;
    var pp = perPage();
    var totalPages = Math.max(1, Math.ceil(total / pp));
    if (currentPage > totalPages) currentPage = totalPages;

    var start = (currentPage - 1) * pp;
    var pageItems = isMobile() ? allMessages : allMessages.slice(start, start + pp);

    listEl.innerHTML = "";

    if (pageItems.length === 0) {
      listEl.innerHTML = '<div class="mb-empty">还没有留言，来做第一个留言的人吧！</div>';
      paginationEl.innerHTML = "";
      return;
    }

    pageItems.forEach(function (msg) {
      var card = document.createElement("div");
      card.className = "mb-card";
      card.dataset.id = msg.id;

      var header = document.createElement("div");
      header.className = "mb-card-header";

      var authorSpan = document.createElement("span");
      authorSpan.className = "mb-author";
      authorSpan.textContent = msg.author;

      var dateSpan = document.createElement("span");
      dateSpan.className = "mb-date";
      var d = new Date(msg.created_at || msg.createdAt);
      dateSpan.textContent = isNaN(d.getTime()) ? "" : d.toLocaleString("zh-CN");

      header.appendChild(authorSpan);
      header.appendChild(dateSpan);

      var contentWrap = document.createElement("div");
      contentWrap.className = "mb-content-wrap collapsed";

      var pre = document.createElement("pre");
      pre.className = "mb-content";
      pre.textContent = msg.content;

      contentWrap.appendChild(pre);
      card.appendChild(header);
      card.appendChild(contentWrap);

      var actions = document.createElement("div");
      actions.className = "mb-card-actions";

      var toggleBtn = document.createElement("button");
      toggleBtn.className = "mb-toggle-btn";
      toggleBtn.textContent = "展开";
      toggleBtn.style.display = "none";
      toggleBtn.addEventListener("click", function () {
        var isCollapsed = contentWrap.classList.contains("collapsed");
        contentWrap.classList.toggle("collapsed");
        toggleBtn.textContent = isCollapsed ? "收起" : "展开";
      });

      var copyBtn = document.createElement("button");
      copyBtn.className = "mb-copy-btn";
      copyBtn.textContent = "复制";
      copyBtn.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(msg.content).then(function () {
            copyBtn.textContent = "已复制 ✓";
            setTimeout(function () { copyBtn.textContent = "复制"; }, 1500);
          }).catch(fallbackCopy);
        } else {
          fallbackCopy();
        }
        function fallbackCopy() {
          var ta = document.createElement("textarea");
          ta.value = msg.content;
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); } catch (_e) { /* ignore */ }
          document.body.removeChild(ta);
          copyBtn.textContent = "已复制 ✓";
          setTimeout(function () { copyBtn.textContent = "复制"; }, 1500);
        }
      });

      actions.appendChild(toggleBtn);
      actions.appendChild(copyBtn);

      if (isAdmin) {
        var delBtn = document.createElement("button");
        delBtn.className = "mb-delete-btn";
        delBtn.textContent = "删除";
        delBtn.addEventListener("click", function () {
          if (!confirm("确定要删除这条留言吗？")) return;
          Storage.remove(msg.id).then(function (list) {
            allMessages = list;
            renderMessages();
          });
        });
        actions.appendChild(delBtn);
      }

      card.appendChild(actions);
      listEl.appendChild(card);

      requestAnimationFrame(function () {
        if (pre.scrollHeight > COLLAPSE_HEIGHT) {
          toggleBtn.style.display = "inline-block";
        } else {
          contentWrap.classList.remove("collapsed");
        }
      });
    });

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    paginationEl.innerHTML = "";
    if (isMobile() || totalPages <= 1) return;

    for (var i = 1; i <= totalPages; i++) {
      (function (page) {
        var btn = document.createElement("button");
        btn.className = "mb-page-btn" + (page === currentPage ? " active" : "");
        btn.textContent = page;
        btn.addEventListener("click", function () {
          currentPage = page;
          renderMessages();
          listEl.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        paginationEl.appendChild(btn);
      })(i);
    }
  }

  /* ---------- Init ---------- */
  function init() {
    if (BACKEND === "local" && localWarning) {
      localWarning.style.display = "block";
    }

    Storage.load().then(function (list) {
      allMessages = list;
      renderMessages();
    });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        renderMessages();
      }, 250);
    });
  }

  /* ---------- Events ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var author = authorInput.value.trim();
    var content = contentInput.value;

    if (!author) { authorInput.focus(); return; }
    if (!content) { contentInput.focus(); return; }

    var msg = {
      id: generateId(),
      author: author,
      content: content,
      created_at: new Date().toISOString()
    };

    Storage.add(msg).then(function (list) {
      allMessages = list;
      currentPage = 1;
      renderMessages();
      contentInput.value = "";
      showToast();
    });
  });

  adminBtn.addEventListener("click", function () {
    if (isAdmin) {
      isAdmin = false;
      adminStatus.textContent = "";
      adminBtn.textContent = "管理";
      renderMessages();
      return;
    }
    var pwd = prompt("请输入管理密码：");
    if (pwd === ADMIN_PWD) {
      isAdmin = true;
      adminStatus.textContent = "管理模式已开启";
      adminBtn.textContent = "退出管理";
      renderMessages();
    } else if (pwd !== null) {
      alert("密码错误");
    }
  });

  init();
})();
