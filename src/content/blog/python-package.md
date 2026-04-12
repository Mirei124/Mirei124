---
title: "python模块打包规范"
pubDate: "2025-02-18T22:50"
updatedDate: "2025-02-20T01:03"
tags: ["python", "pacman"]
category: "技术向"
---

# 目录结构 src-layout

```
project_root_directory
├── pyproject.toml  # AND/OR setup.cfg, setup.py
├── ...
└── src/
    └── mypkg/
        ├── __init__.py
        ├── ...
        ├── module.py
        ├── subpkg1/
        │   ├── __init__.py
        │   ├── ...
        │   └── module1.py
        └── subpkg2/
            ├── __init__.py
            ├── ...
            └── module2.py
```

> [配置关键字](https://setuptools.pypa.io/en/latest/references/keywords.html)

# 添加资源文件

```toml
[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
mypkg = ["*.txt", "*.rst"]
"mypkg.data" = ["*.rst"]

[tool.setuptools.exclude-package-data]
mypkg = [".gitattributes"]
```

# 访问静态资源

```python
import os
# pypkg/data/data1.txt
data_path = os.path.join(os.path.dirname(__file__), 'data', 'data1.txt')
```

# 示例

```toml
[build-system]
requires = ["setuptools", "setuptools-scm"]
build-backend = "setuptools.build_meta"

[project]
name = "my_package"
version = "0.0.1"
authors = [
    {name = "Josiah Carberry", email = "josiah_carberry@brown.edu"},
]
description = "My package description"
readme = "README.rst"
requires-python = ">=3.7"
keywords = ["one", "two"]
license = {text = "BSD-3-Clause"}
classifiers = [
    "Framework :: Django",
    "Programming Language :: Python :: 3",
]
dependencies = [
    "requests",
    'importlib-metadata; python_version<"3.8"',
]
dynamic = ["version"]

[project.optional-dependencies]
pdf = ["ReportLab>=1.2", "RXP"]
rest = ["docutils>=0.3", "pack ==1.1, ==1.3"]

# 命令行工具
[project.scripts]
my-script = "my_package.module:function"

[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
mypkg = ["*.txt", "*.rst"]
"mypkg.data" = ["*.rst"]

[tool.setuptools.exclude-package-data]
mypkg = [".gitattributes"]

# ... other project metadata fields as specified in:
#     https://packaging.python.org/en/latest/specifications/declaring-project-metadata/
```

```
src
├── novelSpider
│   ├── __init__.py
│   ├── run.py
│   ├── spider.py
│   └── static
│       ├── decrypt.js
│       └── style1.css
```

# PKGBUILD

> https://wiki.archlinux.org/title/Python_package_guidelines

## setup.py

```python
from setuptools import setup

setup(
    name='name',
    version='0.0.1',
    install_requires=[
        "numpy"
    ],
    include_package_data=True
)
```

```python
from setuptools import setup

setup()
```

```bash
# python-build
# python-installer
python -m build --wheel --no-isolation
python -m installer --destdir="$pkgdir" dist/*.whl
```
