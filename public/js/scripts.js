(function() {
	var common = {};

	common.getValueByPath = function (unit, path, defaultValue) {
		if(unit === null || unit === undefined) throw "Unit or path can't be empty!";
		if(path === "" || path === null || path === undefined) return unit;

		path = path.replace(/\[(\d+)\]/g, ".$1").replace(/^\./, "").split(/\./);
		$.each(path, function(i, path) {
			unit = unit[path];
			if(unit === null || unit === undefined) {
				unit = null;
				return false;
			}
		});
		if(unit === null && defaultValue !== undefined) {
			unit = defaultValue;
		}
		return unit;
	};

	common.setValueByPath = function(unit, path, value) {
		if(!unit || typeof path !== "string" || path === "") throw "Unit or path can't be empty!";

		var _inArray = false;
		var _end = 0;
		var _start = 0;
		var _unit = unit;

		function _nextPath(array) {
			var _key = path.slice(_start, _end);
			if(_inArray) {
				_key = _key.slice(0, -1);
			}
			if(!_unit[_key]) {
				if(array) {
					_unit[_key] = [];
				} else {
					_unit[_key] = {};
				}
			}
			_unit = _unit[_key];
		}

		for(; _end < path.length ; _end += 1) {
			if(path[_end] === ".") {
				_nextPath(false);
				_start = _end + 1;
				_inArray = false;
			} else if(path[_end] === "[") {
				_nextPath(true);
				_start = _end + 1;
				_inArray = true;
			}
		}

		_unit[path.slice(_start, _inArray ? -1 : _end)] = value;

		return unit;
	};

	// ====================== Array =======================
	common.array = {};

	common.array.find = function(val, list, path, findAll) {
		path = path || "";
		var _list = $.grep(list, function(unit) {
			return val === common.getValueByPath(unit, path);
		});
		return findAll ? _list : (_list.length === 0 ? null : _list[0]);
	};

	common.array.filter = function(val, list, path) {
		return common.array.find(val, list, path, true);
	};

	common.array.remove = function(val, list, path) {
		path = path || "";

		for(var i = 0 ; i < list.length ; i += 1) {
			if(common.getValueByPath(list[i], path) === val) {
				list.splice(i, 1);
				i -= 1;
			}
		}

		return list;
	};

	// ===================== Register =====================
	if(!window.common) {
		window.common = common;
	} else {
		window.COMMON = common;
	}
})();
(function() {
	

	var app = angular.module('app', ['ngRoute', 'configCtrl', 'blogCtrl', 'memoryCtrl', 'ui.bootstrap']);

	app.config(function ($routeProvider) {
		// ==========================================
		// =                  Blog                  =
		// ==========================================
		$routeProvider.when('/home', {
			templateUrl: 'partials/blog/list.html',
			controller: 'listCtrl'
		}).when('/create', {
			templateUrl: 'partials/blog/create.html',
			controller: 'createCtrl'
		}).when('/edit/:createTime', {
			templateUrl: 'partials/blog/create.html',
			controller: 'createCtrl'
		}).when('/blog/:createTime', {
			templateUrl: 'partials/blog/blog.html',
			controller: 'blogCtrl'

		// ==========================================
		// =                 Memory                 =
		// ==========================================
		}).when('/memory', {
			templateUrl: 'partials/memory/list.html',
			controller: 'memoryList'

		// ==========================================
		// =                 Config                 =
		// ==========================================
		}).when('/config/common', {
			templateUrl: 'partials/config/common.html',
			controller: 'configCommonCtrl'

		}).otherwise({
			redirectTo: '/home'
		});
	});

	app.controller('main', function ($scope, Page, Blog, Config, Asset, Git) {
		window.Config = $scope.Config = Config;
		window.Page = $scope.Page = Page;
		window.Blog = $scope.Blog = Blog;
		window.Asset = $scope.Asset = Asset;
		window.Git = $scope.Git = Git;

		$scope.lock = false;

		$scope.$on('$routeChangeStart', function(event, next, current) {
			Page.reset();
		});

		$scope.getDocTitle = function() {
			var subDocTitle = Page.title !== 'Home' && Page.title;
			return Config.get().title + (subDocTitle ? ' - ' + subDocTitle : '');
		};

		$scope.upload = function() {
			$scope.lock = true;
			Git.push().finally(function() {
				$scope.lock = false;
			});
		};

		$scope.rebuild = function() {
			$scope.lock = true;
			Blog.rebuild().then(function() {
				$.dialog({
					title: "Success",
					content: "Rebuild successfully."
				});
				$scope.lock = false;
			});
		};
	});
})();
(function() {
	

	angular.module('app').factory("Asset", function (File, $http, $q) {
		var _list;
		var Asset = function() {};

		Asset.list = function(forceRefresh) {
			if(!_list || forceRefresh) {
				_list = _list || [];
				File.list("data/assets").then(function (list) {
					_list = list;
				});
			}

			return _list;
		};

		Asset.upload = function(files) {
			var _timestamp = +new Date();

			var _promiseList = $.map(files, function(file) {
				var _fileName = _timestamp + "_" + file.name;
				return File.copy(file.path, "data/assets/" + _fileName).then(function() {
					return {
						name: _fileName,
					};
				});
			});

			return $q.all(_promiseList);
		};

		Asset.delete = function(item) {
			var FS = require("fs");
			FS.unlinkSync(File.path("data/assets/" + item));
			Asset.list(true);
		};

		return Asset;
	});
})();
(function() {
	

	angular.module('app').factory("Blog", function (File, $http, $q) {
		var _list;

		var Blog = function() {};

		Blog.ready = false;

		Blog.snapshot = function(blog) {
			var md = new Remarkable({
				html: true,
				xhtmlOut: false,
				breaks: false,
				langPrefix: 'language-',
				linkify: false,
				typographer: false
			});
			var $content = $(md.render(blog.content));

			return {
				title: blog.title,
				introduction: blog.introduction || $content.text().substr(0, 200),
				tags: blog.tags,
				thumbnail: blog.thumbnail,
				createTime: blog.createTime
			};
		};

		// Blog list
		Blog.list = function(forceRefresh) {
			if(!_list || forceRefresh) {
				_list = _list || {};
				$http.get("data/list.json?_=" + (+new Date())).then(function(data) {
					_list = data.data;

					// Parse tags
					_list.tags = {};
					$.each(_list.articles, function(i, article) {
						$.each(article.tags || [], function(j, tag) {
							if(!tag) return;

							var tagArticles = _list.tags[tag] = _list.tags[tag] || [];
							tagArticles.push(article);
						});
					});
				}).finally(function() {
					Blog.ready = true;
				});
			}
			return _list;
		};

		// Fetch
		Blog.fetch = function(createTime) {
			return File.read(File.path("data/articles/" + createTime + ".json")).then(function(data) {
				return JSON.parse(data);
			});
		};

		// Save blog
		Blog.save = function(blog) {
			var _path_article = "data/articles/";
			var _path_list = "data/list.json";

			var _deferred = $q.defer();

			// Write blog
			File.write(File.path(_path_article + blog.createTime + ".json"), JSON.stringify(blog, null, "\t")).then(function() {
				var data;

				// Read blog list
				File.read(File.path(_path_list)).then(function(_data) {
					data = _data;
				}).finally(function() {
					var _list, _entity, i, _match;
					try {
						_list = JSON.parse(data);
					} catch (err) {
						_list = {};
					}
					_list.articles = _list.articles || [];
					_entity = Blog.snapshot(blog);

					// Update if edit mode
					_match = false;
					for (i = 0 ; i < _list.articles.length ; i += 1) {
						if(_list.articles[i].createTime === blog.createTime) {
							_match = i;
							break;
						}
					}

					if(_match === false) {
						_list.articles.unshift(_entity);
					} else {
						_list.articles[_match] = _entity;
					}

					// Update list
					File.write(File.path(_path_list), JSON.stringify(_list, null, "\t")).then(function() {
						_deferred.resolve();
						Blog.list(true);
					}, function(err) {
						_deferred.reject(err);
					});
				}, function(err) {
					_deferred.reject(err);
				});
			});

			return _deferred.promise;
		};

		// Delete blog
		Blog.delete = function(createTime) {
			var data;
			var FS = require("fs");
			var _path_article = "data/articles/";
			var _path_list = "data/list.json";
			var _deferred = $q.defer();

			FS.unlinkSync(File.path(_path_article + createTime + ".json"));

			// Clean list record
			File.read(File.path(_path_list)).then(function(_data) {
				data = _data;
			}).finally(function() {
				var _list;
				try {
					_list = JSON.parse(data);
				} catch (err) {
					_list = {};
				}

				common.array.remove(Number(createTime), _list.articles || [], "createTime");
				// Update list
				File.write(File.path(_path_list), JSON.stringify(_list, null, "\t")).then(function() {
					_deferred.resolve();
					Blog.list(true);
				}, function(err) {
					_deferred.reject(err);
				});
			});

			return _deferred.promise;
		};

		// Rebuild blog
		Blog.rebuild = function() {
			var _deferred = $q.defer();

			File.list(File.path("data/articles/")).then(function(list) {
				var _list = {
					articles: []
				};
				var _promiseList = $.map(list, function(file) {
					return File.read(File.path("data/articles/" + file)).then(function(data) {
						try {
							var _entity = Blog.snapshot(JSON.parse(data));
							_list.articles.push(_entity);
						} catch(err) {
							console.error(err);
						}
					});
				});

				$q.all(_promiseList).then(function() {
					_list.articles.sort(function(a, b) {
						return b.createTime - a.createTime;
					});

					File.write(File.path("data/list.json"), JSON.stringify(_list, null, "\t")).finally(function() {
						_deferred.resolve();
						Blog.list(true);
					});
				});
			});

			return _deferred.promise;
		};

		return Blog;
	});
})();
(function() {
	

	var _configPath = "data/config.json";

	angular.module('app').factory("Config", function (File, Page, $http) {
		var _config;
		var Config = function() {};

		function _configWrap(config) {
			return $.extend({
				title: "My Blog",
				dateFormat: "YYYY-MM-DD HH:mm",
				navFixTop: false
			}, config || {});
		}

		Config.get = function(forceRefresh) {
			if(!Page.local) {
				if(!_config) {
					_config = _configWrap();
					$http.get(_configPath, {params: {_: Math.random()}}).then(function (data) {
						_config = _configWrap(data.data);
					});
				}
			} else if(!_config || forceRefresh) {
				try {
					_config = _configWrap(JSON.parse(File.read(_configPath, true)));
				} catch (err) {
					_config = _configWrap();
				}
			}
			return _config;
		};

		Config.save = function(config) {
			if(config) _config = config;
			return File.write(_configPath, JSON.stringify(_config, null, "\t"));
		};

		return Config;
	});
})();
(function() {
	

	angular.module('app').factory("File", function ($q) {
		var File = function() {};

		// Get relative path
		File.path = function(path) {
			var FS = require("fs");
			var PATH = require("path");
			var _rootPath = "";

			// Get current path
			if(!FS.existsSync("index.html")) {
				_rootPath = process.execPath.replace(/[^\\\/]+\.exe$/, '');
			}

			return PATH.normalize(_rootPath + path);
		};

		// Assume folder
		File.assumeFolder = function(path) {
			var FS = require("fs");
			var PATH = require('path');

			path = PATH.normalize(path);
			if(!FS.existsSync(path)) {
				File.assumeFolder(PATH.dirname(path));
				FS.mkdirSync(path);
			}
		};

		File.write = function(path, data) {
			var FS = require("fs");
			var PATH = require('path');

			var _deferred = $q.defer();
			path = PATH.normalize(path);
			File.assumeFolder(PATH.dirname(path));

			FS.writeFile(path, data, "utf8", function (err) {
				if(err) {
					_deferred.reject(err);
				} else {
					_deferred.resolve();
				}
			});

			return _deferred.promise;
		};
		File.read = function(path, sync) {
			var FS = require("fs");
			var PATH = require('path');

			var _deferred = $q.defer();
			path = PATH.normalize(path);

			if(sync) {
				return FS.readFileSync(path, "utf8");
			} else {
				FS.readFile(path, "utf8", function (err, data) {
					if (err) {
						_deferred.reject(err);
					} else {
						_deferred.resolve(data);
					}
				});
			}

			return _deferred.promise;
		};

		File.list = function(path) {
			var FS = require("fs");
			var PATH = require('path');

			var _deferred = $q.defer();
			path = PATH.normalize(path);

			FS.readdir(path, function(err, list) {
				if(err) {
					_deferred.reject(err);
				} else {
					_deferred.resolve(list);
				}
			});

			return _deferred.promise;
		};

		File.copy = function(src, tgt) {
			var srcFile, tgtFile;
			var FS = require("fs");
			var _deferred = $q.defer();

			var _folder = tgt.match(/(.*)[\\\/].*/)[1];
			File.assumeFolder(_folder);

			srcFile = FS.createReadStream(src);
			tgtFile = FS.createWriteStream(tgt);

			srcFile.on("error", function(err) {
				_deferred.reject(err);
			});
			tgtFile.on("error", function(err) {
				_deferred.reject(err);
			});
			tgtFile.on("close", function() {
				_deferred.resolve(tgt);
			});

			srcFile.pipe(tgtFile);

			return _deferred.promise;
		};

		return File;
	});
})();
(function() {
	

	angular.module('app').factory("Git", function ($q) {
		var Git = function() {};

		function dialogErr(title, content) {
			$.dialog({
				title: title,
				content: content
			});
		}

		Git.push = function() {
			var exec = require('child_process').exec;
			var _deferred = $q.defer();

			// Git: status
			exec("git status", function (error, stdout, stderr) {
				if(stderr) {
					dialogErr("Git Status Error", stderr);
					_deferred.reject();
				} else {
					$.dialog({
						title: "Git Status Confirm",
						content: $("<pre>").text(stdout.trim()),
						confirm: true
					}, function(ret) {
						if(!ret) {
							_deferred.reject();
							return;
						}

						// Git: add .
						exec("git add .", function (error, stdout, stderr) {
							if(stderr) {dialogErr("Git Add Error", stderr);_deferred.reject();}
							exec('git commit -m "update blog"', function (error, stdout, stderr) {
								if(stderr) {dialogErr("Git Commit Error", stderr);_deferred.reject();}
								exec("git push", function (error, stdout, stderr) {
									$.dialog({
										title: "Git Push Done",
										content: $("<pre>").text((stdout + "\n" + stderr).trim())
									});
									_deferred.resolve();
								});
							});
						});
					});
				}
			});

			return _deferred.promise;
		};

		return Git;
	});
})();
(function() {
	

	angular.module('app').factory("Memory", function (File, Asset, $http, $q) {
		var _list;
		var _path_list = "data/memoryList.json";

		var Memory = function() {};

		Memory.ready = false;

		// Blog list
		Memory.list = function(forceRefresh) {
			if(!_list || forceRefresh) {
				_list = _list || {};
				$http.get("data/memoryList.json?_=" + (+new Date())).then(function(data) {
					_list = $.extend(_list, data.data);
				}).finally(function() {
					Memory.ready = true;
				});
			}
			return _list;
		};

		// Save blog
		Memory.save = function(memory) {
			var _deferred = $q.defer();

			// Write blog
			var data;

			// Read blog list
			File.read(File.path(_path_list)).then(function(_data) {
				data = _data;
			}).finally(function() {
				var _list;
				try {
					_list = JSON.parse(data);
				} catch (err) {
					_list = {};
				}
				_list.memories = _list.memories || [];
				_list.memories.push(memory);

				// Update list
				File.write(File.path(_path_list), JSON.stringify(_list, null, "\t")).then(function() {
					_deferred.resolve();
					Memory.list(true);
				}, function(err) {
					_deferred.reject(err);
				});
			}, function(err) {
				_deferred.reject(err);
			});

			return _deferred.promise;
		};

		Memory.delete = function (mem) {
			var _deferred = $q.defer();
			common.array.remove(mem, _list.memories);

			// Update list
			File.write(File.path(_path_list), JSON.stringify(_list, null, "\t")).then(function() {
				_deferred.resolve();
				Memory.list(true);
				if(mem.thumbnail) {
					Asset.delete(mem.thumbnail.replace("data/assets/", ""));
				}
			}, function(err) {
				_deferred.reject(err);
			});

			return _deferred.promise;
		};

		return Memory;
	});
})();
(function() {
	

	angular.module('app').factory("Page", function () {
		var _origin = {
			title: "",
			subTitle: "",
			hideTitle: false,

			menu: []
		};

		var Page = {
			local: !!window.require
		};

		Page.reset = function() {
			$.extend(Page, _origin);
		};
		Page.reset();

		return Page;
	});
})();
(function() {
	

	var blogCtrl = angular.module('blogCtrl', ['ngRoute', 'ui.bootstrap']);

	// ==============================================================
	// =                            List                            =
	// ==============================================================
	blogCtrl.controller('listCtrl', function ($scope, Page, Blog) {
		Page.title = "Home";

		$scope.pageSize = 10;
		$scope.currentPage = 1;

		$scope.tag = "";
		$scope.setTag = function(tag, force) {
			if(force) {
				$scope.tag = tag;
			} else {
				$scope.tag = $scope.tag === tag ? "" : tag;
			}

			$("#tags").collapse('show');
		};

		$scope.articles = function() {
			var _list = Blog.list();
			if(!$scope.tag) {
				return _list.articles ? _list.articles : [];
			} else {
				return (_list.tags ? _list.tags[$scope.tag] : []) || [];
			}
		};

		$scope.pageArticles = function() {
			return $scope.articles().slice(($scope.currentPage - 1) * $scope.pageSize, $scope.currentPage * $scope.pageSize);
		};
	});

	// ==============================================================
	// =                            View                            =
	// ==============================================================
	blogCtrl.controller('blogCtrl', function ($q, $http, $scope, $routeParams, Page, Blog, Config) {
		Page.hideTitle = true;
		$scope.ready = false;

		var canceler = $q.defer();
		$http.get("data/articles/" + $routeParams.createTime + ".json", {
			params: {_: Math.random()},
			timeout: canceler.promise
		}).then(function(data) {
			$scope.ready = true;
			$scope.blog = data.data;
			$scope.date = new moment($scope.blog.createTime).format(Config.get().dateFormat);
			Page.title = $scope.blog.title;

			var md = new Remarkable({
				html: true,
				xhtmlOut: false,
				breaks: false,
				langPrefix: 'language-',
				linkify: false,
				typographer: false
			});

			$("#article .article-cntr").html(
				md.render($scope.blog.content)
			);
			$("#article .article-cntr table").addClass("table table-bordered");
		}, function() {
			$.dialog({
				title: "OPS",
				content: "Can't load blog."
			});
		});

		$scope.delete = function() {
			$.dialog({
				title: "Delete Confirm",
				content: "Are you sure to delete this article?",
				confirm: true
			}, function(ret) {
				if(!ret) return;

				Blog.delete($routeParams.createTime).then(function() {
					$.dialog({
						title: "Delete success",
						content: "Delete success. Close dialog to go to the home page.",
					}, function() {
						location.href = "#/home";
					});
				}, function() {
					$.dialog({
						title: "Delete failed",
						content: "Unknown exception for deleting.",
					});
				});
			});
		};

		$scope.$on('$destroy', function() {
			canceler.resolve();
		});
	});

	// ==============================================================
	// =                            Edit                            =
	// ==============================================================
	blogCtrl.controller('createCtrl', function ($scope, $routeParams, Page, Blog, Asset) {
		var _refreshMD_id;
		var $win = $(window);

		Page.title = "Create";
		Page.hideTitle = true;
		Page.menu = [
			{name: "Save", func: save, disabled: saveDisabled}
		];

		Asset.list(true);

		$scope.resView = false;
		$scope.tags = "";
		$scope.blog = {content: ""};
		if($routeParams.createTime) {
			Blog.fetch($routeParams.createTime).then(function(blog) {
				$scope.blog = blog;
				$scope.tags = ($scope.blog.tags || []).join(",");
				updateMD();
			});
		}

		// ===================== Function =====================
		$scope.isImage = function(name) {
			return /\.(jpg|jpeg|bmp|png|gif)/i.test(name);
		};

		$scope.timeDesc = function(itemName) {
			var _moment =  new moment(Number(itemName.substr(0,13)));
			return _moment.toString();
		};

		$scope.selectItem = function(item) {
			if($scope.isImage(item)) {
				$scope.blog.content += ($scope.blog.content ? "\n" : "") + "![](data/assets/" + item + ")";
			} else {
				$scope.blog.content += ($scope.blog.content ? "\n" : "") + item;
			}
			updateMD();
		};

		$scope.deleteAsset = function(item) {
			$.dialog({
				title: "Delete Confirm",
				content: "Do you want to delete '" + item + "'?",
				confirm: true
			}, function(ret) {
				if(ret) {
					Asset.delete(item);
					$scope.$apply();
				}
			});
		};

		// ======================= Edit =======================
		var md = new Remarkable({
			html: true,
			xhtmlOut: false,
			breaks: false,
			langPrefix: 'language-',
			linkify: false,
			typographer: false
		});

		function updateMD() {
			$("#overview .article-cntr").html(
				md.render($scope.blog.content)
			);
			$("#overview .article-cntr table").addClass("table table-bordered");
		}

		$scope.update = function () {
			clearTimeout(_refreshMD_id);
			_refreshMD_id = setTimeout(updateMD, 200);
		};

		// ======================= Save =======================
		function save() {
			var _tags = {};
			var _thumbnail = ($scope.blog.content.match(/^!\[[^\]]*]\(([^\)]*)(\s+"[^"]*")?\)/) || [])[1];

			$.each($scope.tags.split(/\s*,\s*/), function(i, tag) {
				_tags[tag] = tag;
			});
			$scope.blog.tags = $.map(_tags, function(tag) {
				return tag;
			});
			$scope.blog.createTime = $scope.blog.createTime || +new Date();

			$scope.blog.thumbnail = _thumbnail;

			Blog.save($scope.blog).then(function() {
				$.dialog({
					title: "Success",
					content: "Save complete! Go to home page?",
					confirm: true
				}, function(ret) {
					if(ret) {
						location.href = "#/home";
					}
				});
			}, function(err) {
				$.dialog({
					title: "OPS",
					content: "Save error: " + err
				});
			});
		}

		function saveDisabled() {
			return !$scope.blog.title || !$scope.blog.content;
		}

		// ======================== UI ========================
		// Asset drop
		$("#editArticle").on("drop", function(event) {
			var files = event.originalEvent.dataTransfer.files;
			if(files.length) {
				event.preventDefault();
				event.stopPropagation();

				Asset.upload(files).then(function(list) {
					Asset.list(true);
					$.each(list, function(i, file) {
						$scope.blog.content += ($scope.blog.content ? "\n" : "") + "![](data/assets/" + file.name + ")";
					});
					updateMD();
				});
			} else {
				var content = event.originalEvent.dataTransfer.getData("Text");
				if($scope.isImage(content)) {
					event.preventDefault();
					event.stopPropagation();

					$scope.blog.content += ($scope.blog.content ? "\n" : "") + "![](" + content + ")";
					$scope.$apply();
					updateMD();
				}
			}
		});

		// Window resize
		$scope.resize = function(delay) {
			$("body").addClass("lockSidebar");
			setTimeout(function() {
				var $article = $("#editArticle");
				var $overview = $("#overview .article-cntr");
				var $resView = $("#resView");
				$article.css("min-height", $win.height() - $article.offset().top - 15);
				$overview.outerHeight($win.height() - ($overview.offset() || {top: 0}).top - 25);
				$resView.outerHeight($win.height() - ($resView.offset() || {top: 0}).top - 15);
				$("body").removeClass("lockSidebar");
			}, delay);
		};
		$win.on("resize.edit", $scope.resize);
		$scope.resize(100);

		// Clean up
		$scope.$on("$destroy", function() {
			$win.off("resize.edit");
		});
	});
})();
(function() {
	

	var configCtrl = angular.module('configCtrl', ['ngRoute', 'ui.bootstrap']);

	configCtrl.controller('configCommonCtrl', function ($scope, Page, Config) {
		Page.title = "Config";
		$scope.config = $.extend({}, Config.get(), true);

		$scope.save = function() {
			Config.save($scope.config).then(function() {
				$.dialog({
					title: "Success",
					content: "Save successfully!"
				});
			}, function(err) {
				$.dialog({
					title: "OPS",
					content: "Save failed! " + err
				});
			});
		};
	});
})();
(function() {
	

	var memoryCtrl = angular.module('memoryCtrl', ['ngRoute', 'ui.bootstrap']);

	// ==============================================================
	// =                            List                            =
	// ==============================================================
	memoryCtrl.controller('memoryList', function ($scope, Page, Memory, Asset) {
		Page.title = "Memory";

		$scope.new = {};
		var _tmpImageFile = "";

		var $memTip = $("#memTip");
		$memTip.hide();

		// Memory list
		$scope.memoryHolder = Memory.list();

		// Memory tooltip
		$scope.enterMemory = function (mem, $event) {
			var $tgt = $($event.currentTarget);
			$scope.currentMemory = mem;
			$memTip.stop().fadeIn();

			// Position
			var winWidth = $(window).width();
			var tgtOffset = $tgt.offset();
			var offset = $.extend({}, tgtOffset);
			offset.left += $tgt.outerWidth();
			offset.top -= 35;
			if(offset.left + $memTip.outerWidth() > winWidth) {
				offset.left = tgtOffset.left - $memTip.outerWidth();
			}
			$memTip.offset(offset);
		};
		$scope.leaveMemory = function () {
			$memTip.stop().fadeOut();
		};

		// Memory update
		$scope.newMemory = function () {
			$scope.new = {};
			_tmpImageFile = "";
			$("#memoryMDL").modal();
		};
		$scope.saveMemory = function () {
			_tmpImageFile = "";
			$("#memoryMDL").modal("hide");

			$scope.createTime = +new Date();
			Memory.save($scope.new);
		};
		$scope.deleteMemory = function (mem) {
			if(Page.local) {
				$.dialog({
					title: "Delete Confirm",
					content: "Do you want to delete '" + mem.title + "'?",
					confirm: true
				}, function (ret) {
					if(ret) {
						Memory.delete(mem);
					}
				});
			}
		};

		$("#memoryMDL").on("dragover", ".memoryWindow", function (event) {
			event.preventDefault();
		});
		$("#memoryMDL").on("drop", ".memoryWindow", function(event) {
			var files = event.originalEvent.dataTransfer.files;
			if(files.length) {
				event.preventDefault();
				event.stopPropagation();

				Asset.upload([files[0]]).then(function(list) {
					_tmpImageFile = list[0].name;
					$scope.new.thumbnail = "data/assets/" + _tmpImageFile;
				});
			}
		});
		$("#memoryMDL").on("hidden.bs.modal", function () {
			if(_tmpImageFile) {
				Asset.delete(_tmpImageFile);
			}
		});
	});
})();