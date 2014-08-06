---
layout: post
title:  "开始旅途"
date:   2014-07-28 23:03:05
categories: jekyll
snapshot: "使用Jekyll搭建你的个人博客"
---

blog it
之前一直想试试jekyll建一个博客，正好这次服务器到期了，切过来罢。  
那么第一篇就学习一下windows下如何安装jekyll吧~  
注：以下命令没有说明都在cmd中运行。如果觉得以下步骤太麻烦，你也可以在linux下安装（推荐）。

### 安装Ruby
废话不多说，先去下载一个ruby的客户端：<http://rubyinstaller.org/>  
（很多情况下，中国大部分资源都被墙，如果没得翻墙，可以复制地址用迅雷下）

接下去安装淘宝源（你懂的）：

	gem sources --remove https://rubygems.org/
	gem sources -a http://ruby.taobao.org/


###安装jekyll

	gem install jekyll

这个时候你会遇到报错信息并提示：

>Please update your PATH to include build tools or download the DevKit
>from 'http://rubyinstaller.org/downloads' and follow the instructions
>at 'http://github.com/oneclick/rubyinstaller/wiki/Development-Kit'

然后再次上<http://rubyinstaller.org/downloads>下载DEVELOPMENT KIT并解压。使用cmd定位到解压目录。运行：

	ruby dk.rb init

目录下会生成```config.yml```文件。打开改成：

	- 你的ruby所在目录

注：要记得带前面的“-”，如果要保留其原本的内容也可以。但是记得给所有行首都添加“#”符号。  
（如果你想学习```yaml```文件格式请参考：<http://zh.wikipedia.org/zh-cn/YAML>，不学也没关系。和本次主题没关系）

在当前cmd继续输入：

	ruby dk.rb install

然后再次安装jekyll：

	gem install jekyll

安装完毕后就可以开始建你的blog了。

定位到你放置博客的文件夹目录，建立blog项目：

	jekyll new 你的blog名字

运行你的项目：

	jekyll serve

这时会报错，告诉你没有安装python。

打开_config.yml，添加：
highlighter: false

或者安装[python](https://www.python.org/downloads/)。  
（注：安装2.7.*版本，3不行哦~）

之后就可以运行了。

运行时会报waring，但是不影响使用。  
(注：网上有说卸载pygments，重新安装0.5.0版本就行。我发现jekyll已经用pygments 0.6.0。退回到0.5.0感觉也很奇怪。再说罢……)