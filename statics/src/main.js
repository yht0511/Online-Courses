// 配 置
var BaseURI = "";
var CatalogConfig = [
  {
    name: "日 期 ",
    function: GetDates,
    command: 'document.CatalogVariables["date"]=',
    async: true,
    clicked: [
      {
        name: "主 页 ",
        function: BackFunc,
        async: false,
        clicked: GoHome,
      },
      {
        name: "全 部 ",
        function: WholeFunc,
        command: 'document.CatalogVariables["last"]=document.NowConfig;',
        async: false,
        clicked: [
          {
            name: "返 回 ",
            function: BackFunc,
            async: false,
            clicked: GoBack,
          },
          {
            name: "跳 转 科 目 ",
            function: GetSubjects,
            command: 'document.CatalogVariables["subject"]=',
            async: true,
            clicked: JumpToSubject,
          },
          {
            name: "全 天 视 频 ",
            function: PlayWhole,
            async: false,
          },
        ],
      },
      {
        name: "进 入 科 目 ",
        function: GetSubjects,
        command: 'document.CatalogVariables["subject"]=',
        async: true,
        clicked: PlaySubject,
      },
    ],
  },
];
document.CatalogVariables = {};
document.NowConfig = CatalogConfig;
var PlayList = [];
var now_player = "video_player_1";
var current_num = 0;
var FROM = 0;
var TO = 0;
var START = 0;
var BASETIME = 0;
var BASETIME_ARR = [];
const RATE_MAP = [0.25, 0.5, 1, 1.25, 1.5, 2, 3, 5, 10];
var RATE_NUM = 2;
var paused = false;
$("#time")[0].innerText = "00:00:00";
// 目 录
// 获 取 日 期
function GetDates(callback) {
  $.get(BaseURI + "/dates", function (res) {
    callback(JSON.parse(res));
  });
}
// 获 取 视 频 表
function GetList(date, callback) {
  $.get(
    BaseURI + "/list?date=" + date + "&code=" + GetMD5Code(),
    function (res) {
      callback(JSON.parse(res));
    }
  );
}
// 获 取 科 目
function GetJSONSubjects(callback) {
  $.get(BaseURI + "/subjects.json", function (res) {
    callback(res);
  });
}
// 获 取 当 天 科 目
function GetSubjects(callback, all) {
  GetJSONSubjects(function (res) {
    var day = new Date(document.CatalogVariables["date"]).getDay() - 1;
    if (new Date(document.CatalogVariables["date"]).getDay() == 0) day = 6;
    var r = res[day];
    if (all) {
      callback(r);
      return;
    }
    var ans = [];
    for (let i in r) ans.push(r[i]);
    callback(ans);
  });
}
// 根 据 日 期 和 科 目 获 取 时 间 戳 范 围
function GetSubjectTimestamp(callback) {
  GetSubjects(function (res) {
    for (let i in res) {
      if (res[i] == document.CatalogVariables["subject"]) {
        var a = i.split("-");
        var from =
          new Date(document.CatalogVariables["date"] + " " + a[0]).getTime() /
          1000;
        var to =
          new Date(document.CatalogVariables["date"] + " " + a[1]).getTime() /
          1000;
        callback(from, to);
      }
    }
  }, true);
}
// 获 取 全 部 时 间 戳 范 围
function GetWholeTimestamp(callback) {
  GetSubjects(function (res) {
    var from = 99999999999;
    var to = 0;
    for (let i in res) {
      var a = i.split("-");
      var f =
        new Date(document.CatalogVariables["date"] + " " + a[0]).getTime() /
        1000;
      var t =
        new Date(document.CatalogVariables["date"] + " " + a[1]).getTime() /
        1000;
      if (f < from) from = f;
      if (t > to) to = t;
    }
    callback(from, to);
  }, true);
}
// 查 找 目 录 配 置
function FindCatalogConfig(loc, config) {
  if (!config) config = CatalogConfig;
  for (let i of config) {
    if (typeof i == "object")
      if (i["name"] == loc) return i;
      else if (
        typeof i["clicked"] == "object" &&
        FindCatalogConfig(loc, i["clicked"])
      )
        return FindCatalogConfig(loc, i["clicked"]);
  }
  return;
}
function BlankCallback(callback) {
  callback("");
}
function WholeFunc() {
  ShowCheckRes();
  return ["全 部 "];
}
function BackFunc() {
  return ["返 回 "];
}
function GoBack() {
  document.NowConfig = document.CatalogVariables["last"];
  RenderCatalog();
}
function GoHome() {
  document.NowConfig = CatalogConfig;
  RenderCatalog();
}
// 渲 染 目 录
function RenderCatalog() {
  $("#Catalog").children().remove(); // 清 除 原 有 选 项
  for (let index in document.NowConfig) {
    document.NowConfig[index] = FindCatalogConfig(
      document.NowConfig[index]["name"]
    );
    var func = document.NowConfig[index]["function"];
    // console.log(document.NowConfig[index]);
    var options = "";
    if (!document.NowConfig[index]["async"]) {
      options = func();
      func = BlankCallback;
    }
    func(function (res) {
      if (!options) options = res;
      for (let option of options) {
        if (typeof document.NowConfig[index]["clicked"] == "object")
          if (document.NowConfig[index]["command"])
            var div =
              '<div class="CatalogOption" onclick=\'' +
              document.NowConfig[index]["command"] +
              '"' +
              option +
              '";document.NowConfig=' +
              JSON.stringify(document.NowConfig[index]["clicked"]) +
              ";RenderCatalog();'>" +
              option +
              "</div>";
          else
            var div =
              '<div class="CatalogOption" onclick=\'document.NowConfig=' +              JSON.stringify(document.NowConfig[index]["clicked"]) +
              ";RenderCatalog();'>" +
              option +
              "</div>";
        else if (document.NowConfig[index]["command"]) {
          var div =
            '<div class="CatalogOption" onclick=\'' +
            document.NowConfig[index]["command"] +
            '"' +
            option +
            '";document.' +
            document.NowConfig[index]["clicked"].name +
            '("' +
            option +
            "\");'>" +
            option +
            "</div>";
          eval(
            "document." +
              document.NowConfig[index]["clicked"].name +
              "=" +
              document.NowConfig[index]["clicked"].name
          );
        } else {
          var div =
            '<div class="CatalogOption" onclick=\'document.' +
            document.NowConfig[index]["clicked"].name +
            '("' +
            option +
            "\");'>" +
            option +
            "</div>";
          eval(
            "document." +
              document.NowConfig[index]["clicked"].name +
              "=" +
              document.NowConfig[index]["clicked"].name
          );
        }
        // console.log(div);
        $("#Catalog").append(div);
      }
    });
  }
}
RenderCatalog();
document.RenderCatalog = RenderCatalog;
function JumpToSubject() {
  GetWholeTimestamp(function (whole_from, whole_to) {
    GetSubjectTimestamp(function (subject_from, subject_to) {
      // console.log(subject_from - whole_from);
      Play(
        document.CatalogVariables["date"],
        whole_from,
        whole_to,
        subject_from - whole_from
      );
    });
  });
}
function PlayWhole() {
  GetWholeTimestamp(function (from, to) {
    Play(document.CatalogVariables["date"], from, to, 0);
  });
}
function PlaySubject(subject) {
  GetSubjectTimestamp(function (from, to) {
    // console.log(from, to);
    Play(document.CatalogVariables["date"], from, to, 0);
  });
}
function Play(date, from, to, start) {
  FROM = from;
  TO = to;
  START = start;
  GetList(date, function (res) {
    PlayList = [];
    var start_num = 9999;
    var i = 0;
    res.sort(function (a, b) {
      return a["from"] - b["from"];
    });
    for (let r of res) {
      if (r["from"] <= to && r["to"] >= from + start && start_num > i)
        start_num = i;
      if (r["from"] <= to && r["to"] >= from) {
        PlayList.push(r);
        i += 1;
      }
    }
    if (PlayList.length == 0) {
      alert("无 文 件 !");
      return;
    }
    if (start_num == 9999) start_num = 0;
    current_num = start_num;
    BASETIME = PlayList[start_num]["from"] - from;
    BASETIME_ARR = PlayList.slice(0, start_num);
    paused = false;
    $("#video_player_1")[0].pause();
    $("#video_player_2")[0].pause();
    $("#video_player_1")[0].src =
      BaseURI + PlayList[start_num]["path"] + "?code=" + GetMD5Code();
    $("#video_player_1")[0].currentTime =
      start + from - PlayList[start_num]["from"];
    $("#video_player_1")[0].play();
    $("#video_player_1").show();
    $("#video_player_2")[0].src =
      BaseURI + PlayList[start_num + 1]["path"] + "?code=" + GetMD5Code();    $("#video_player_2")[0].currentTime = 0;
    $("#video_player_2").hide();
    $("#video_player_1")[0].playbackRate = RATE_MAP[RATE_NUM];
    $("#video_player_2")[0].playbackRate = RATE_MAP[RATE_NUM];
  });
}
$("#video_player_1")[0].addEventListener("timeupdate", function (e) {
  check_permission(PlayList[current_num]);
  if ($("#video_player_1")[0].currentTime <= 0) return;
  var percent =
    (100 * (BASETIME + $("#video_player_1")[0].currentTime)) / (TO - FROM);
  $("#progress")[0].style.width = percent + "%";
  $("#time")[0].innerText = TimestampToStringTime(
    (percent / 100) * (TO - FROM) + FROM
  );
  $("#subtitle")[0].innerText = GetSubtitle(
    $("#video_player_1")[0].currentTime
  );
});
$("#video_player_2")[0].addEventListener("timeupdate", function (e) {
  check_permission(PlayList[current_num]);
  if ($("#video_player_2")[0].currentTime <= 0) return;
  var percent =
    (100 * (BASETIME + $("#video_player_2")[0].currentTime)) / (TO - FROM);
  $("#progress")[0].style.width = percent + "%";
  $("#time")[0].innerText = TimestampToStringTime(
    (percent / 100) * (TO - FROM) + FROM
  );
  $("#subtitle")[0].innerText = GetSubtitle(
    $("#video_player_2")[0].currentTime
  );
});
$("#progress_bar")[0].onmousemove = function (e) {
  var percent = (100 * e.clientX) / $("#progress_bar")[0].clientWidth;
  $("#loc")[0].style.left = percent + "%";
  $("#time_hover")[0].innerText = TimestampToStringTime(
    (percent / 100) * (TO - FROM) + FROM
  );
  var ttime = (percent / 100) * (TO - FROM) + FROM;
  for (let i in PlayList) {
    if (
      parseFloat(PlayList[i]["from"]) < ttime &&
      parseFloat(PlayList[i]["to"]) > ttime
    ) {
      var time =
        (parseFloat(PlayList[i]["duration"]) *
          (ttime - parseFloat(PlayList[i]["from"]))) /
        (PlayList[i]["to"] - PlayList[i]["from"]);
      var res = GetSubtitle(time, i);
      $("#subtitle_hover")[0].innerText = res;
      if (res != "") {
        break;
      }
    }
  }
};
$("#progress_bar")[0].onclick = function (e) {
  $("#loc")[0].style.left =
    (100 * e.clientX) / $("#progress_bar")[0].clientWidth + "%";
  Play(
    document.CatalogVariables["date"],
    FROM,
    TO,
    ((TO - FROM) * e.clientX) / $("#progress_bar")[0].clientWidth
  );
};
function TimestampToStringTime(time) {
  var day = new Date(time * 1000);
  var hh = String(day.getHours()).padStart(2, "0");
  var mm = String(day.getMinutes()).padStart(2, "0");
  var ss = String(day.getSeconds()).padStart(2, "0");
  return hh + ":" + mm + ":" + ss;
}
$(document).keydown(function (event) {
  console.log(event);
  if (event.keyCode == 189) {
    $("#Catalog").hide();
  }
  if (event.keyCode == 187) {
    $("#Catalog").show();
  }
  if (event.keyCode == 37) {
    if (!$("#video_player_1")[0].ended && !$("#video_player_1")[0].paused)      $("#video_player_1")[0].currentTime -= 10;
    if (!$("#video_player_2")[0].ended && !$("#video_player_2")[0].paused)      $("#video_player_2")[0].currentTime -= 10;
  }
  if (event.keyCode == 39) {
    if (!$("#video_player_1")[0].ended && !$("#video_player_1")[0].paused)      $("#video_player_1")[0].currentTime += 10;
    if (!$("#video_player_2")[0].ended && !$("#video_player_2")[0].paused)      $("#video_player_2")[0].currentTime += 10;
  }
  if (event.keyCode == 83) {
    if (RATE_NUM > 0) RATE_NUM -= 1;
    $("#video_player_1")[0].playbackRate = RATE_MAP[RATE_NUM];
    $("#video_player_2")[0].playbackRate = RATE_MAP[RATE_NUM];
    $("#rate")[0].innerText = RATE_MAP[RATE_NUM] + "x";
  }
  if (event.keyCode == 70) {
    if (RATE_NUM < RATE_MAP.length - 1) RATE_NUM += 1;
    $("#video_player_1")[0].playbackRate = RATE_MAP[RATE_NUM];
    $("#video_player_2")[0].playbackRate = RATE_MAP[RATE_NUM];
    $("#rate")[0].innerText = RATE_MAP[RATE_NUM] + "x";
  }
  if (event.keyCode == 32) {
    if (paused) {
      paused.play();
      paused = false;
    } else {
      if (!$("#video_player_1")[0].ended && !$("#video_player_1")[0].paused) {
        paused = $("#video_player_1")[0];
        $("#video_player_1")[0].pause();
      } else if (
        !$("#video_player_2")[0].ended &&
        !$("#video_player_2")[0].paused
      ) {
        paused = $("#video_player_2")[0];
        $("#video_player_2")[0].pause();
      }
    }
  }
  if (event.keyCode == 191) {
    $("#subtitle").toggle();
  }
});
$("#video_player_1")[0].addEventListener("ended", switch_2);
$("#video_player_2")[0].addEventListener("ended", switch_1);
$("#lower")[0].addEventListener("click", function () {
  if (RATE_NUM > 0) RATE_NUM -= 1;
  $("#video_player_1")[0].playbackRate = RATE_MAP[RATE_NUM];
  $("#video_player_2")[0].playbackRate = RATE_MAP[RATE_NUM];
  $("#rate")[0].innerText = RATE_MAP[RATE_NUM] + "x";
});
$("#faster")[0].addEventListener("click", function () {
  if (RATE_NUM < RATE_MAP.length - 1) RATE_NUM += 1;
  $("#video_player_1")[0].playbackRate = RATE_MAP[RATE_NUM];
  $("#video_player_2")[0].playbackRate = RATE_MAP[RATE_NUM];
  $("#rate")[0].innerText = RATE_MAP[RATE_NUM] + "x";
});
$("#switch_sidebar")[0].addEventListener("click", function () {
  if ($("#switch_sidebar")[0].innerText == "|>") {
    $("#Catalog").show();
    $("#switch_sidebar")[0].innerText = "<|";
  } else {
    $("#Catalog").hide();
    $("#switch_sidebar")[0].innerText = "|>";
  }
});
$("#stop")[0].addEventListener("click", function () {
  if (paused) {
    paused.play();
    paused = false;
  } else {
    if (!$("#video_player_1")[0].ended && !$("#video_player_1")[0].paused) {
      paused = $("#video_player_1")[0];
      $("#video_player_1")[0].pause();
    } else if (
      !$("#video_player_2")[0].ended &&
      !$("#video_player_2")[0].paused
    ) {
      paused = $("#video_player_2")[0];
      $("#video_player_2")[0].pause();
    }
  }
});
function switch_2() {
  // console.log("切 换 到 player2");
  $("#video_player_1")[0].playbackRate = RATE_MAP[RATE_NUM];
  $("#video_player_2")[0].playbackRate = RATE_MAP[RATE_NUM];
  // console.log(current_num, BASETIME_ARR);
  $("#video_player_1")[0].pause();
  $("#video_player_1").hide();
  $("#video_player_2").show();
  $("#video_player_2")[0].play();
  if (BASETIME_ARR.indexOf(PlayList[current_num]) == -1) {
    BASETIME_ARR.push(PlayList[current_num]);
    BASETIME += PlayList[current_num]["duration"];
    current_num += 1;
  }
  if (current_num >= PlayList.length) {
    return;
  }
  $("#video_player_1")[0].src =
    BaseURI + PlayList[current_num + 1]["path"] + "?code=" + GetMD5Code();  $("#video_player_1")[0].currentTime = 0;
}
function switch_1() {
  // console.log("切 换 到 player1");
  $("#video_player_1")[0].playbackRate = RATE_MAP[RATE_NUM];
  $("#video_player_2")[0].playbackRate = RATE_MAP[RATE_NUM];
  $("#video_player_2")[0].pause();
  $("#video_player_2").hide();
  $("#video_player_1").show();
  $("#video_player_1")[0].play();
  if (BASETIME_ARR.indexOf(PlayList[current_num]) == -1) {
    BASETIME_ARR.push(PlayList[current_num]);
    BASETIME += PlayList[current_num]["duration"];
    current_num += 1;
  }
  if (current_num >= PlayList.length) {
    return;
  }
  $("#video_player_2")[0].src =
    BaseURI + PlayList[current_num + 1]["path"] + "?code=" + GetMD5Code();  $("#video_player_2")[0].currentTime = 0;
}
function GetSubtitle(time, num) {
  if (!num) num = current_num;
  var sub = PlayList[num]["subtitle"];
  var min = 9999999;
  var ans = "";
  for (let s in sub) {
    if (Math.abs(time - parseFloat(sub[s]["from"])) < min) {
      min = Math.abs(time - parseFloat(sub[s]["from"]));
      ans = sub[s]["text"];
    }
    if (Math.abs(time - parseFloat(sub[s]["to"])) < min) {
      min = Math.abs(time - parseFloat(sub[s]["to"]));
      ans = sub[s]["text"];
    }
  }
  if (min > 1) ans = "";
  return ans;
}
var checking = false;
function check_permission(data) {
  if (data["protected"] && !localStorage.getItem("code") && !checking) {
    checking = true;
    var code = window.prompt("当 前 时 段 文 件 受 保 护 ,请 输 入 管 理 密 钥 ");
    if (code) {
      $.get(BaseURI + "/check_code?code=" + GetMD5Code(code), function (res) {
        if (res == 1) {
          window.alert("管 理 密 钥 已 确 认 .");
          localStorage.setItem("code", code);
          window.location.reload();
        } else {
          window.alert("管 理 密 钥 被 拒 绝 .");
        }
        checking = false;
      });
    } else {
      checking = false;
    }
  }
}
function GetMD5Code(c) {
  if (localStorage.getItem("code")) c = localStorage.getItem("code");
  if (c) {
    return md5(c + " - time:" + parseInt(new Date().getTime() / 1000));
  }
  return "";
}
function ShowCheckRes() {
  var date = document.CatalogVariables["date"];
  $.get(
    BaseURI + "/check?code=" + GetMD5Code() + "&date=" + date,
    function (res) {
      if (res["message"]) alert("当 前 已 归 档 时 间 段 :\n" + res["message"]);
    }
  );
}
//if (window.location.origin.indexOf("61.163.58.154") == -1) {
//  window.location.href = "http://61.163.58.154:4380/";
//}
window.onload = function () {
  setTimeout(function () {
    document.getElementById("mask").style.visibility = "hidden";
  }, 2000);
};
if (localStorage.getItem("code"))
  $.get(BaseURI + "/check_code?code=" + GetMD5Code(), function (res) {
    if (res == 1) {
      window.alert("欢 迎 ,Researcher!");
    } else {
      localStorage.removeItem("code");
      window.alert("管 理 密 钥 被 拒 绝 ,请 重 新 验 证 ...");
    }
  });