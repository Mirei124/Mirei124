---
title: "git常用命令"
pubDate: "2021-07-28T14:00"
updatedDate: "2025-03-23T11:35"
tags: ["git"]
category: "技术向"
---

# git常用命令

1. 初始化一个Git仓库，使用`git init`命令。
2. 添加文件到Git仓库，分两步：
   1. 使用命令`git add <file>`，注意，可反复多次使用，添加多个文件；
   2. 使用命令`git commit -m <message>`，完成。

> 💡 使用命令`git commit --amend`修正最后一次提交

3. 要随时掌握工作区的状态，使用`git status`命令。
4. 如果`git status`告诉你有文件被修改过，用`git diff`可以查看修改内容。

# 回退

1. `git log`命令显示从最近到最远的提交日志
   1. 如果嫌输出信息太多，看得眼花缭乱的，可以试试加上`--pretty=oneline`参数
   2. 用`HEAD`表示当前版本,上一个版本就是`HEAD^`,当然往上100个版本写100个^比较容易数不过来，所以写成`HEAD~100`
2. 回退到上一版本
   1. 撤销add和commit，**不保存**代码修改 `git reset --hard HEAD^`
   2. 撤销add和commit，**保存**代码修改 `git reset HEAD^` 或 `git reset --mixed HEAD^`
   3. 只撤销commit `git reset --soft HEAD^`
   4. `git reset --hard origin/master` 或 `git fetch —all`
   5. 强制推送远程 `git push origin HEAD --force`
3. `git reflog`用来记录你的每一次命令
4. 命令`git checkout -- readme.txt`意思就是，把`readme.txt`文件在工作区的**修改全部撤销**，这里有两种情况：
   - 一种是`readme.txt`自修改后还没有被放到暂存区，现在，撤销修改就回到和版本库一模一样的状态；
   - 一种是`readme.txt`已经添加到暂存区后，又作了修改，现在，撤销修改就回到添加到暂存区后的状态。
   - **总之，就是让这个文件回到最近一次git commit或git add时的状态。**
5. 命令`git reset HEAD <file>`可以把暂存区的修改撤销掉（unstage），**重新放回工作区**
6. 命令`git rm`用于删除一个文件

# 关联远程库

1. 要关联一个远程库，使用命令`git remote add origin git@server-name:path/repo-name.git`；
2. 关联一个远程库时必须给远程库指定一个名字，`origin`是默认习惯命名；
3. 关联后，使用命令`git push -u origin master`第一次推送master分支的所有内容；
4. 此后，每次本地提交后，只要有必要，就可以使用命令`git push origin master`推送最新修改；
5. 如果添加的时候地址写错了，或者就是想删除远程库，可以用`git remote rm <name>`命令。使用前，建议先用`git remote -v`查看远程库信息

# 分支

1. 分支
   1. 查看分支：`git branch`
   2. 创建分支：`git branch <name>`
   3. 创建分支并关联远程：`git checkout -b devbranch origin/devbranch`
   4. 手动关联上游分支：`git branch --set-upstream develop origin/develop`
   5. 切换分支：`git checkout <name>`或者`git switch <name>`
   6. 创建+切换分支：`git checkout -b <name>`或者`git switch -c <name>`
   7. 合并某分支到当前分支：`git merge <name>`
   8. 删除分支：`git branch -d <name>`
2. 分支合并图`git log --graph --pretty=oneline --abbrev-commit`
3. 合并分支时，加上--no-ff参数就可以用普通模式合并，合并后的历史有分支，能看出来曾经做过合并，而fast forward合并就看不出来曾经做过合并。
   - `git merge --no-ff -m "merge with no-ff" dev`
4. BUG分支
   1. `git stash`可以把当前工作现场“储藏”起来，等以后恢复现场后继续工作
   2. 可以多次`stash`，恢复的时候，先用`git stash list`查看，然后恢复指定的stash
   3. 工作现场还在，Git把`stash`内容存在某个地方了，但是需要恢复一下，有两个办法：
      1. 一是用`git stash apply`恢复，但是恢复后，stash内容并不删除，你需要用`git stash drop`来删除；
      2. 另一种方式是用`git stash pop`，恢复的同时把stash内容也删了
   4. Git专门提供了一个`cherry-pick`命令，让我们能复制一个特定的提交到当前分支
      - `git cherry-pick 4c805e2`

# 多人协作

1. 要查看远程库的信息，用`git remote`，用`git remote -v`显示更详细的信息
2. 推送分支
   - `git push origin master`
   - `git push origin dev`
3. 要在dev分支上开发，就必须创建远程origin的dev分支到本地，于是他用这个命令创建本地dev分支
   - `git checkout -b dev origin/dev`
4. 推送失败，因为你的小伙伴的最新提交和你试图推送的提交有冲突，解决办法也很简单，先用`git pull`把最新的提交从`origin/dev`抓下来，然后，在本地合并，解决冲突，再推送
   1. 指定本地dev分支与远程origin/dev分支的链接
      - `git branch --set-upstream-to=origin/dev dev`
   2. `git pull`
   3. `git commit -m "fix env conflict"`

- **多人协作的工作模式**通常是这样：
  1.  首先，可以试图用`git push origin <branch-name>`推送自己的修改；
  2.  如果推送失败，则因为远程分支比你的本地更新，需要先用`git pull`试图合并；
  3.  如果合并有冲突，则解决冲突，并在本地提交；
  4.  没有冲突或者解决掉冲突后，再用`git push origin <branch-name>`推送就能成功！
  5.  如果`git pull`提示`no tracking information`，则说明本地分支和远程分支的链接关系没有创建，用命令`git branch --set-upstream-to <branch-name> origin/<branch-name>`。

# 标签

1. 命令`git tag <name>`就可以打一个新标签
2. 命令`git tag`查看所有标签
3. 对提交打标签`git tag v0.9 f52c633`
4. 用`git show <tagname>`查看标签信息
5. 创建带有说明的标签，用`-a`指定标签名，`-m`指定说明文字
   - `git tag -a v0.1 -m "version 0.1 released" 1094adb`
6. 命令`git push origin <tagname>`可以推送一个本地标签；
7. 命令`git push origin --tags`可以推送全部未推送过的本地标签；
8. 命令`git tag -d <tagname>`可以删除一个本地标签；
9. 命令`git push origin :refs/tags/<tagname>`可以删除一个远程标签。
10. 查询远程tags`git ls-remote --tags origin`

# 别名

1. `git config --global alias.st status`
2. `git config --global alias.unstage 'reset HEAD'`
3. `git config --global alias.last 'log -1'`
4. `git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"`

# 加速

1. `git config --global url."[https://hub.fastgit.xyz/](https://hub.fastgit.xyz/)".insteadOf "[https://github.com/](https://github.com/)"

git config protocol.https.allow always`

2. `git config --global http.proxy http://127.0.0.1:7890`

> 199.232.69.194 [github.global.ssl.fastly.net](http://github.global.ssl.fastly.net/) # github
> 140.82.114.3 [github.com](http://github.com/) # github

# 单分支克隆

```sh
git clone --branch=master --single-branch --filter=blob:none https://xxx.git

# 添加分支
git remote set-branches --add origin branch_name
git fetch origin

# 添加所有分支
git remote set-branches origin '*'
git fetch
```

# 补充

1. 查看每次提交修改内容`git whatchanged`
2. 更改远程地址 `git remote set-url origin https://github.com/kwin-scripts/kwin-tiling.git`
3. 查看远程地址 `git remote get-url origin`
4. git 版本号

```shell
tag='3.4.1'
echo "${tag}.r$(git rev-list --count ${tag}..HEAD).$(git rev-parse --short HEAD)"
```

5. 忽略文件 `vi .git/info/exclude`
6. 查找大文件 `git rev-list --objects --all | git cat-file --batch-check="%(objectname) %(objectsize) %(rest)" | sort -nuk2`

## 克隆子文件夹

```sh
mkdir myrepo
cd myrepo
git init
git remote add origin <url>
git config core.sparseCheckout true
echo "src/" >> .git/info/sparse-checkout
git fetch --depth=1 origin main
git checkout main
# or
mkdir myrepo
cd myrepo
git init
git remote add origin <url>
git sparse-checkout init
git sparse-checkout set <directory-or-file-path>
git fetch --depth=1 origin main
git checkout main
```

## 克隆子模块

```sh
# https://stackoverflow.com/questions/53896924/convert-gitmodules-into-a-parsable-format-for-iteration-using-bash/53899440#53899440
install_submodules() {
  git -C "${REPO_PATH}" config -f .gitmodules --get-regexp '^submodule\..*\.path$' |
    while read -r KEY MODULE_PATH; do
      # If the module's path exists, remove it.
      # This is done b/c the module's path is currently
      # not a valid git repo and adding the submodule will cause an error.
      [ -d "${MODULE_PATH}" ] && sudo rm -rf "${MODULE_PATH}"

      NAME="$(echo "${KEY}" | sed 's/^submodule\.\(.*\)\.path$/\1/')"

      url_key="$(echo "${KEY}" | sed 's/\.path$/.url/')"
      branch_key="$(echo "${KEY}" | sed 's/\.path$/.branch/')"

      URL="$(git config -f .gitmodules --get "${url_key}")"
      BRANCH="$(git config -f .gitmodules --get "${branch_key}" || echo "master")"

      git -C "${REPO_PATH}" submodule add --force -b "${BRANCH}" --name "${NAME}" "${URL}" "${MODULE_PATH}" || continue
    done

  git -C "${REPO_PATH}" submodule update --init --recursive
}
```
