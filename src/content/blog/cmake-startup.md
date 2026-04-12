---
title: "cmake入门"
pubDate: "2024-02-01T12:00"
updatedDate: "2024-02-01T12:00"
tags: ["cmake", "cpp"]
category: "技术向"
---

# CMakeLists.txt

## cmake 变量

| Variable                 | Info                                                       |
| ------------------------ | ---------------------------------------------------------- |
| CMAKE_SOURCE_DIR         | 根源代码目录，工程顶层目录。暂认为就是PROJECT_SOURCE_DIR   |
| CMAKE_CURRENT_SOURCE_DIR | 当前处理的 CMakeLists.txt 所在的路径                       |
| PROJECT_SOURCE_DIR       | 工程顶层目录                                               |
| CMAKE_BINARY_DIR         | 运行cmake的目录。外部构建时就是build目录                   |
| CMAKE_CURRENT_BINARY_DIR | The build directory you are currently in.当前所在build目录 |
| PROJECT_BINARY_DIR       | 暂认为就是CMAKE_BINARY_DIR                                 |

## target_include_directories

- PRIVATE - 目录被添加到目标（库）的包含路径中。
- INTERFACE - 目录没有被添加到目标（库）的包含路径中，而是链接了这个库的其他目标（库或者可执行程序）包含路径中
- PUBLIC - 目录既被添加到目标（库）的包含路径中，同时添加到了链接了这个库的其他目标（库或者可执行程序）的包含路径中

```cmake
cmake_minimum_required(VERSION 3.5) #设置CMake最小版本
project (hello_cmake) #设置工程名，可以用${PROJECT_NAME}引用
add_executable(hello_cmake main.cpp) #生成可执行文件
```

# 包含头文件

```cmake
set(SOURCES
    src/Hello.cpp
    src/main.cpp
    ) #创建一个变量，名字叫SOURCES。它包含了所有的cpp文件。

add_executable(hello_headers ${SOURCES})#用所有的源文件生成一个可执行文件，因为这里定义了SOURCE变量，所以就不需要罗列cpp文件了
#等价于命令：     add_executable(hello_headers src/Hello.cpp src/main.cpp)

target_include_directories(hello_headers
    PRIVATE
        ${PROJECT_SOURCE_DIR}/include
)#设置这个可执行文件hello_headers需要包含的库的路径
```

# 包含静态库

```cmake
#库的源文件Hello.cpp生成静态库hello_library
add_library(hello_library STATIC
    src/Hello.cpp
)
target_include_directories(hello_library
    PUBLIC
        ${PROJECT_SOURCE_DIR}/include
)

# Add an executable with the above sources
#指定用哪个源文件生成可执行文件
add_executable(hello_binary
    src/main.cpp
)
#链接可执行文件和静态库
target_link_libraries( hello_binary
    PRIVATE
        hello_library
)
```

# 包含动态库

```cmake
#根据Hello.cpp生成动态库
add_library(hello_library SHARED
    src/Hello.cpp
)
#给动态库hello_library起一个别的名字hello::library
add_library(hello::library ALIAS hello_library)
#为这个库目标，添加头文件路径，PUBLIC表示包含了这个库的目标也会包含这个路径
target_include_directories(hello_library
    PUBLIC
        ${PROJECT_SOURCE_DIR}/include
)

#根据main.cpp生成可执行文件
add_executable(hello_binary
    src/main.cpp
)
#链接库和可执行文件，使用的是这个库的别名。PRIVATE 表示
target_link_libraries(hello_binary
    PRIVATE
        hello::library
)
```

# 设置构建类型

```cmake
cmake_minimum_required(VERSION 3.5)
#如果没有指定则设置默认编译方式
if(NOT CMAKE_BUILD_TYPE AND NOT CMAKE_CONFIGURATION_TYPES)
  #在命令行中输出message里的信息
  message("Setting build type to 'RelWithDebInfo' as none was specified.")
  #不管CACHE里有没有设置过CMAKE_BUILD_TYPE这个变量，都强制赋值这个值为RelWithDebInfo
  set(CMAKE_BUILD_TYPE RelWithDebInfo CACHE STRING "Choose the type of build." FORCE)

  # 当使用cmake-gui的时候，设置构建级别的四个可选项
  set_property(CACHE CMAKE_BUILD_TYPE PROPERTY STRINGS "Debug" "Release"
    "MinSizeRel" "RelWithDebInfo")
endif()


project (build_type)
add_executable(cmake_examples_build_type main.cpp)
```

## set命令

该命令可以为普通变量、缓存变量、环境变量赋值

### 普通变量

`set(<variable> <value>... [PARENT_SCOPE])` 分号分隔变量

设置的变量值 作用域属于整个 CMakeLists.txt 文件。当这个语句中加入PARENT_SCOPE后，表示要设置的变量是父目录中的CMakeLists.txt设置的变量。

如果父目录中有变量`Bang`,在子目录中可以直接使用（比如用message输出`Bang`，值是父目录中设置的值）并且利用set()修改该变量`Bang`的值，但是如果希望在出去该子CMakeLists.txt对该变量做出的修改能够得到保留，那么就需要在set()命令中加入Parent scope这个变量。当然，如果父目录中本身没有这个变量，子目录中仍然使用了parent scope，那么出了这个作用域后，该变量仍然不会存在。

### CACHE变量

`set(<variable> <value>... CACHE <type> <docstring> [FORCE])`

运行cmake时变量值会被缓存，重新运行cmake时将会默认使用这个值。只有加上FORCE关键字，新设置的值才会覆盖之前设置的缓存，否则不会覆盖缓存。

### 环境变量

`set(ENV{<variable>} [<value>])`

# 编译选项

```cmake
cmake_minimum_required(VERSION 3.5)
#强制设置默认C++编译标志变量为缓存变量，如CMake（五） build type所说，该缓存变量被定义在文件中，相当于全局变量，源文件中也可以使用这个变量
set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DEX2" CACHE STRING "Set C++ Compiler Flags" FORCE)

project (compile_flags)

add_executable(cmake_examples_compile_flags main.cpp)
#为可执行文件添加私有编译定义，即gcc -DEX3
target_compile_definitions(cmake_examples_compile_flags
    PRIVATE EX3
)

# 为某一目标设置编译选项
target_compile_options(<target> [BEFORE]
  <INTERFACE|PUBLIC|PRIVATE> [items1...]
  [<INTERFACE|PUBLIC|PRIVATE> [items2...] ...])
```

c编译：`CMAKE_C_FLAGS`
cpp编译：`CMAKE_CXX_FLAGS`
链接：`CMAKE_LINKER_FLAGS`

# 添加Boost库

```cpp
// main.cpp
#include <boost/shared_ptr.hpp>
#include <boost/filesystem.hpp>
```

```cmake
cmake_minimum_required(VERSION 3.5)

# Set the project name
project (third_party_include)
# find a boost install with the libraries filesystem and system
#使用库文件系统和系统查找boost install
find_package(Boost 1.46.1 REQUIRED COMPONENTS filesystem system)
#这是第三方库，而不是自己生成的静态动态库
# check if boost was found
if(Boost_FOUND)
    message ("boost found")
else()
    message (FATAL_ERROR "Cannot find Boost")
endif()

# Add an executable
add_executable(third_party_include main.cpp)

# link against the boost libraries
target_link_libraries( third_party_include
    PRIVATE
        Boost::filesystem
)
```

Boost-库名称。 这是用于查找模块文件FindBoost.cmake的一部分
1.46.1 - 需要的boost库最低版本
REQUIRED - 告诉模块这是必需的，如果找不到会报错
COMPONENTS - The list of components to find in the library

找到包后，它会自动导出变量，这些变量可以通知用户在哪里可以找到库，头文件或可执行文件。 与XXX_FOUND变量类似，它们与包绑定在一起，通常记录在FindXXX.cmake文件的顶部

# 使用clang编译工程

c编译器：`CMAKE_C_COMPILER`
cpp编译器：`CMAKE_CXX_COMPILER`
链接器：`CMAKE_LINKER`

# 使用Ninja构建工程

`cmake . . -GNinja`

# 设置cpp标准

```cmake
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")
// 或者
set(CMAKE_CXX_STANDARD 11)
```

> 参考：https://github.com/ttroy50/cmake-examples
