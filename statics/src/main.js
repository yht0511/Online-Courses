// 配置
var BaseURI = "";
var CatalogConfig = [
  {
    name: "日期",
    function: GetDates,
    command: 'document.CatalogVariables["date"]=',
    async: true,
    clicked: [
      {
        name: "主页",
        function: BackFunc,
        async: false,
        clicked: GoHome,
      },
      {
        name: "全部",
        function: WholeFunc,
        command: 'document.CatalogVariables["last"]=document.NowConfig;',
        async: false,
        clicked: [
          {
            name: "返回",
            function: BackFunc,
            async: false,
            clicked: GoBack,
          },
          {
            name: "跳转科目",
            function: GetSubjects,
            command: 'document.CatalogVariables["subject"]=',
            async: true,
            clicked: JumpToSubject,
          },
          {
            name: "全天视频",
            function: PlayWhole,
            async: false,
          },
        ],
      },
      {
        name: "进入科目",
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

// 目录
// 获取日期
function GetDates(callback) {
  $.get(BaseURI + "/dates", function (res) {
    callback(JSON.parse(res));
  });
}
// 获取视频表
function GetList(date, callback) {
  $.get(BaseURI + "/list?date=" + date, function (res) {
    callback(JSON.parse(res));
  });
}
// 获取科目
function GetJSONSubjects(callback) {
  $.get(BaseURI + "/subjects.json", function (res) {
    callback(res);
  });
}
// 获取当天科目
function GetSubjects(callback, all) {
  GetJSONSubjects(function (res) {
    var r = res[new Date(document.CatalogVariables["date"]).getDay() - 1];
    if (all) {
      callback(r);
      return;
    }
    var ans = [];
    for (let i in r) ans.push(r[i]);
    callback(ans);
  });
}
// 根据日期和科目获取时间戳范围
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
// 获取全部时间戳范围
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

// 查找目录配置
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
  return ["全部"];
}
function BackFunc() {
  return ["返回"];
}
function GoBack() {
  document.NowConfig = document.CatalogVariables["last"];
  RenderCatalog();
}
function GoHome() {
  document.NowConfig = CatalogConfig;
  RenderCatalog();
}

// 渲染目录
function RenderCatalog() {
  $("#Catalog").children().remove(); // 清除原有选项
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
              '<div class="CatalogOption" onclick=\'document.NowConfig=' +
              JSON.stringify(document.NowConfig[index]["clicked"]) +
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
      alert("无文件!");
      return;
    }
    if (start_num == 9999) start_num = 0;
    current_num = start_num;
    BASETIME = PlayList[start_num]["from"] - from;
    BASETIME_ARR = PlayList.slice(0, start_num);
    paused = false;
    $("#video_player_1")[0].pause();
    $("#video_player_2")[0].pause();

    $("#video_player_1")[0].src = BaseURI + PlayList[start_num]["path"];
    $("#video_player_1")[0].currentTime =
      start + from - PlayList[start_num]["from"];
    $("#video_player_1")[0].play();
    $("#video_player_1").show();
    $("#video_player_2")[0].src = BaseURI + PlayList[start_num + 1]["path"];
    $("#video_player_2")[0].currentTime = 0;
    $("#video_player_2").hide();

    $("#video_player_1")[0].playbackRate = RATE_MAP[RATE_NUM];
    $("#video_player_2")[0].playbackRate = RATE_MAP[RATE_NUM];
  });
}

$("#video_player_1")[0].addEventListener("timeupdate", function (e) {
  if ($("#video_player_1")[0].currentTime <= 0) return;
  var percent =
    (100 * (BASETIME + $("#video_player_1")[0].currentTime)) / (TO - FROM);
  $("#progress")[0].style.width = percent + "%";
  $("#time")[0].innerText = TimestampToStringTime(
    (percent / 100) * (TO - FROM) + FROM
  );
});

$("#video_player_2")[0].addEventListener("timeupdate", function (e) {
  if ($("#video_player_2")[0].currentTime <= 0) return;
  var percent =
    (100 * (BASETIME + $("#video_player_2")[0].currentTime)) / (TO - FROM);
  $("#progress")[0].style.width = percent + "%";
  $("#time")[0].innerText = TimestampToStringTime(
    (percent / 100) * (TO - FROM) + FROM
  );
});

$("#progress_bar")[0].onmousemove = function (e) {
  var percent = (100 * e.clientX) / $("#progress_bar")[0].clientWidth;
  $("#loc")[0].style.left = percent + "%";
  $("#time_hover")[0].innerText = TimestampToStringTime(
    (percent / 100) * (TO - FROM) + FROM
  );
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
  // console.log(event);
  if (event.keyCode == 189) {
    $("#Catalog").hide();
  }
  if (event.keyCode == 187) {
    $("#Catalog").show();
  }
  if (event.keyCode == 37) {
    if (!$("#video_player_1")[0].ended && !$("#video_player_1")[0].paused)
      $("#video_player_1")[0].currentTime -= 10;
    if (!$("#video_player_2")[0].ended && !$("#video_player_2")[0].paused)
      $("#video_player_2")[0].currentTime -= 10;
  }
  if (event.keyCode == 39) {
    if (!$("#video_player_1")[0].ended && !$("#video_player_1")[0].paused)
      $("#video_player_1")[0].currentTime += 10;
    if (!$("#video_player_2")[0].ended && !$("#video_player_2")[0].paused)
      $("#video_player_2")[0].currentTime += 10;
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
});

$("#video_player_1")[0].addEventListener("ended", switch_2);
$("#video_player_2")[0].addEventListener("ended", switch_1);

function switch_2() {
  // console.log("切换到player2");
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
  $("#video_player_1")[0].src = BaseURI + PlayList[current_num + 1]["path"];
  $("#video_player_1")[0].currentTime = 0;
}

function switch_1() {
  // console.log("切换到player1");
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
  $("#video_player_2")[0].src = BaseURI + PlayList[current_num + 1]["path"];
  $("#video_player_2")[0].currentTime = 0;
}
