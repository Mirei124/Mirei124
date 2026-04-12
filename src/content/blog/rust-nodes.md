---
title: "rust学习笔记"
pubDate: "2023-04-18T22:50"
updatedDate: "2023-04-20T01:03"
tags: ["rust"]
category: "技术向"
---

# 数组

```rust
let a: [i32; 5] = [1, 2, 3, 4, 5];
let a = [3; 5] = [3, 3, 3, 3, 3];
```

```rust
let number = if condition {
1
} else {
2
};
```

# loop

```rust
loop {
do someting;
}

fn main() {
    let mut counter = 0;
    let result = loop {
        counter +=1;
        if counter %10 == 0 {
            break counter * 10;
        }
    };
    log(result);
}

while condition {
dosomething;
}

for element in a.iter() {}

// 1-32
for num in (1..33).rev() {
	println!("{}", num);
}
// 1-33
1..=33
```

# 所有权

- Rust 中的每一个值都有一个对应的变量作为它的所有者 。
- 在同一时间内,值有且仅有一个所有者。
- 当所有者离开自己的作用域时,它持有的值就会被释放掉。

```rust
let s1 = String::from("test string");
let s2 = s1; //浅拷贝，移动
// 这里s1将被废弃，无法再使用
let s2 = s1.clone(); //深拷贝，s1仍能使用
```

> 类似于整型的类型可以在编译时确定自己的大小,并且能够将自己的数据完整地存储在栈中,对于这些值的复制操作永远都是非常快速的。调用 clone 并不会与直接的浅度拷贝有任何行为上的区别。
> Rust 提供了一个名为 Copy 的 trait,它可以用于整数这类完全存储在栈上的数据类型,一旦某种类型拥有了 Copy 这种 trait,那么它的变量就可以在赋值给其他变量之后保持可用性。

## 拥有 copy trait 的类型

- 所有的整数类型,诸如 u32。
- 仅拥有两种值(true 和 false)的布尔类型:bool。
- 字符类型:char。
- 所有的浮点类型,诸如 f64。
- 如果元组包含的所有字段的类型都是 Copy 的,那么这个元组也是 Copy 的。例如,(i32, i32)是 Copy 的,但(i32, String)则不是。

## 可变引用

```rust
fn change(some_string: &mut String) {
    some_string.push_str(", world!");
}

fn main() {
    let mut s = String::from("hello");
    change(&mut s);
}
```

# 结构体简化写法

```rust
struct User {
    email: String,
    username: String,
    active: bool,
    sign_in_count: u64,
}

fn build_user(name: String, email: String) -> User {
    User {
	    // email: email,
        email,
        name,
        active: true,
        sign_in_count: 1,
    }
}

fn main() {
    let email = String::from("email");
    let name = String::from("name");
    let user1 = build_user(name, email);
	let user2 = User {
		email: String::from("email2"),
        name: String::from("user2"),
        // 其余值与user1相同
        ..user1
    };
}
```

## 元祖结构体

```rust
struct Color(i32, i32, i32);
```

## 结构体调试

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 10,
        height: 3,
    };
    println!("area is {:#?}", rect1);
}
```

## 方法

```rust
struct Rect {
width: u32,
height: u32
}

impl Rect {
	fn area(&self) -> u32 {
		self.width*self.height
	 }
}
```

> 方法可以在声明时选择获取 self 的所有权,也可以像本例一样采用不可变的借用&self,或者
> 采用可变的借用&mut self。总之,就像是其他任何普通的参数一样。

## 关联函数

```rust
impl Rectangle {
    fn square(size: u32) -> Rectangle {
        Rectangle { width: size, height: size }
    }
}

fn main() {
    let square1 = Rectangle::square(4);
    println!("{:?}", square1);
}
```

# 枚举

```rust
enum IpAddrKind {
    V4(u8, u8, u8, u8),
    V6(String),
    Move {x: i32, y: i32 },
}

let home = IpAddrKind::V4(127, 0, 0, 1);

// 枚举方法
impl IpAddrKind {
	fn call(&self) {

	}
}
```

## Option

```rust
// 标准库定义为
enum Option<T> {
	Some(T),
	None,
}
let a_num = Some(3);
let absent_num: Option<i32> = None;
```

## match

```rust
enum Coin {
	Penny,
	Nickel,
	Dime,
	Quarter,
}

fn value_in_cents(coin: Coin) -> u32 {
	match coin {
		Coin::Penny => 1,
		Coin::Nickel => 5,
		Coin::Dime => 10,
		Coin::Quarter => 25,
	}
}

let some_u8_value = 0u8;
match some_u8_value {
	1 => println!("one"),
	3 => println!("three"),
	_ => println!("Nothing"),
	// 表示什么也不发生
	// _ => (),
};

// if let
let value = Some(3);
//     模式      表达式
if let Some(3) = value {
	println!("three");
}

// if let else
let mut count = 0;
match coin {
	Coin::Quarter(state) => println!("something"),
	_ => count +=1,
}

if let Coin::Quarter(state) = coin {
	println!("something");
} else {
	count+=1;
}

```

# 模块

- 一个包中只能拥有最多一个库单元包
- 包可以拥有任意多个二进制单元包
- 包内至少需存在一个单元包（库单元包或二进制单元包）

> Cargo 会默认将 src/main.rs 视作一个二进制单元包的根节点而无须指定,这个二进制单元包与包拥有相同的名称。同样地,假设包的目录中包含文件 src/lib.rs, Cargo 也会自动将其视作与包同名的库单元包的根节点。

处于父级模块中的条目无法使用子模块中的私有条目,但子模块中的条目可以使用它所有祖先模块中的条目。模块默认私有，子模块可访问祖先模块，祖先模块默认不可访问子模块。

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}

        fn seat_at_table() {}
    }

    mod serving {
        fn take_order() {}

        fn serve_order() {}

        fn take_payment() {}
    }
}

pub fn eat_at_restaurant() {
	// 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();
    // 相对路径
    front_of_house::hosting::add_to_waitlist();
}
```

## super

```rust
fn serve_order() {}

mod back_of_house {
	fn fix_incorrect_order() {
		cook_order();
		// super跳转到back_of_house的父模块
		super::serve_order();
	}

	fn cook_order() {}
}
```

## 公共结构体

```rust
mod back_of_house {
    pub struct Breakfast {
        pub toast: String,
        seasonal_frult: String,
    }

    impl Breakfast {
        pub fn summer(toast: &str) -> Breakfast {
            Breakfast {
                toast: String::from(toast),
                seasonal_frult: String::from("peaches"),
            }
        }
    }
}

pub fn eat_at_restaurant() {
    let mut meal = back_of_house::Breakfast::summer("Rye");

    meal.toast = String::from("Wheat");
    println!("I'd like {} toast please", meal.toast);

	// 无法通过编译，因为seasonal_frult为私有变量
    // meal.seasonal_frult = String::from("blueberies");
}
```

## 公共枚举

```rust
pub enum Appetizer {
	Soup,
	Salad,
}
// 公开枚举会同时将所有字段公开
```

## use

```rust
// as
use std::fmt::Result;
use std::io::Result as IoResult;

use std::{cmp::Ordering, io};

use std::io;
use std::io::Write;
// ==
use std::io::{self, Write};

use std::colllections::*;

mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```

### 重导出

```rust
pub use crate::front_of_house::hosting;
```

> 在 mod front_of_house 后使用分号而不是代码块会让 Rust 前往与
> 当前模块同名的文件中加载模块内容。

```rust
// src/lib.rs
mod front_of_house;

pub use crate::front_of_house::hosting;
pub fn eat_at_restaurant() {
hosting::add_to_waitlist();
hosting::add_to_waitlist();
hosting::add_to_waitlist();
}

// src/front_of_house.rs
pub mod hosting {
	pub fn add_to_waitlist() {}
}
```

# 随机数

```rust
use rand::Rng;
fn main() {
	let secret_number = rand::thread_rng().gen_range(1, 101);
}
```

# 动态数组

```rust
let v: Vec<i32> = Vec::new();
let mut v = vec![1, 2, 3];
v.push(3);
let third: &i32 = &v[2];

match v.get(2) {
	Some(3) => println!("3"),
	None => println!("None"),
}
```

## [[#迭代器|遍历]]

## 枚举存储不同类型的值

```rust
enum SpreadsheetCell {
	Int(i32),
	Float(f64),
	Text(String),
}

let row = vec![
	SpreadsheetCell::Int(3),
	SpreadsheetCell::Text(String::from("blue")),
	SpreadsheetCell::Float(10.12),
];
```

# String

```rust
let mut s = String::from("hello");
s.push_str(", world"); // 添加字符

// 切片
let s = String::from("hello world");
let hello = &s[0..5];
let len = s.len();
let world = &s[6..len];
let world = &s[6..];

let s1 = String::from("切记");
let test = &s1[0..3]; // 前三字节数据
println!("{}", test); // 切
```

> 切记要小心谨慎地使用范围语法创建字符串切片,因为错误的指令会导致程序崩溃
> 只能将&str 与 String 相加,而不能将两个 String 相加

```rust
let mut s = String::from("foo");
s.push_str("bar");
s.push('l'); // 拼接单个字符
let s1 = String::from("Hello,");
let s2 = String::from("world!");
let s3 = s1 + &s2; // s1被移动

// 格式化
let s1 = String::from("tic");
let s2 = String::from("tac");
let s3 = String::from("toe");

let s = format!("{}-{}-{}", s1, s2, s3);
```

```rust
// 遍历
let s = String::from("Здравствуйте");
for i in s.chars() { // 遍历每个字符
    println!("{}", i);
}
for i in s.bytes() { // 遍历每一原始字节数据
    println!("{}", i);
}
```

# 哈希映射 hashmap

```rust
let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

let teams = vec![String::from("Blue"), String::from("Yellow")];
let init_scores = vec![10, 50];

let scores: HashMap<_, _> = teams.iter().zip(init_scores.iter()).collect();
```

> 这里的类型标记 HashMap<\_, \_> 不能被省略,因为 collect 可以作
> 用于许多不同的数据结构,如果不指明类型的话,Rust 就无法知道我
> 们具体想要的类型。但是对于键值的类型参数,我们则使用了下画线
> 占位,因为 Rust 能够根据动态数组中的数据类型来推导出哈希映射所
> 包含的类型。

## 读取

```rust
let score = scores.get(&String::from("Blue"));
match score {
	Some(i) => println!("{}", i),
	None => (),
}

for (k, v) in &scores {
	println!("{}: {}", k, v);
}
```

## 更新值

```rust
// 覆盖旧值
let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Blue"), 25);
println!("{:?}", scores);

// 键不存在时插入
scores.entry(String::from("Blue")).or_insert(50);

// 基于旧值更新值
let text = "hello world wonderful world";
let mut map = HashMap::new();
for word in text.split_whitespace() {
	let count = map.entry(word).or_insert(0);
	*count += 1;
}
println!("{:?}", map);
```

# 错误处理

假如项目需要使最终二进制包尽可能小, Cargo.toml 文件中的\[profile\]区域添加`panic='abort'`来将 panic 的默认行为从展开切换为终止。例如,如果你想要在发布式中使用终止模式,那么可以在配置文件中加入:

```toml
[profile.release]
panic = 'abort'
```

```rust
use std::{fs::File, io::ErrorKind};

fn main() {
    let _f = File::open("hello.txt");

    let _f = match _f {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => panic!("create file error"),
            },
            other_errors => panic!("{:?}", other_errors),
        },
    };
}

fn main() {
    let f = File::open("hello.txt").map_err(|error| {
        if error.kind() == ErrorKind::NotFound {
            File::create("hello.txt").unwrap_or_else(|error| {
                panic!("create failed: {:?}", error);
            })
        } else {
            panic!("uknown error");
        }
    });
}

// ok时取出值，err时调用panic
let f = File::open("hello.txt").unwrap();
// 同上，但可指定panic的提示信息
let f = File::open("hello.txt").expect("custom");
```

## 传播错误

```rust
fn read_username_from_file() -> Result<String, io::Error> {
    let f = File::open("hello.txt");

    let mut f = match f {
        Ok(file) => file,
        Err(e) => return Err(e),
    };
    let mut s = String::new();
    match f.read_to_string(&mut s) {
        Ok(_) => Ok(s),
        Err(e) => Err(e),
    }
}

// 简化
fn read_username_from_file() -> Result<String, io::Error> {
    let mut f = File::open("hello.txt")?;
    let mut s = String::new();
    f.read_to_string(&mut s)?;
    Ok(s)
}
fn read_username_from_file() -> Result<String, io::Error> {
    let mut s = String::new();
    File::open("hello.txt")?.read_to_string(&mut s)?;
    Ok(s)
}

fn read_username_from_file() -> Result<String, io::Error> {
    fs::read_to_string("hello.txt")
}
```

1. 句尾的?会将存储在 Ok 内部的值返回给变量 f。如果出现了错误,?就会提前结束整个函数的执行,并将任何可能的 Err 值返回给函数调用者
2. ?运算符只能被用于返回 Result 的函数
3. Rust 提供了一个函数 fs::read_to_string,用于打开文件,创建一个新 String,并将文件中的内容读入这个 String,接着返回给调用者

```rust
use std::error::Error;
// Box<dyn Error>: 任何可能的错误
fn main() -> Result<(), Box<dyn Error>> {
    Ok(())
}
```

## 自定义类型

```rust
struct Guess {
    value: i32,
}
impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 || value > 100 {
            panic!("Guess value must be between 1 and 100, got {}", value);
        }
        Guess { value }
    }

    pub fn value(&self) -> i32 {
        self.value
    }
}
```

# 泛型

将使用到的泛型写到尖括号里

```rust
fn largest<T>(list: &[T]) -> T {
    let mut largest = list[0];
    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }
    largest
}

struct Point<T> {
	y: T,
	x: T,
}
struct Point<T, U> {
	x: T,
	y: U,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

# 单独为f32类型添加方法
impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}
```

## trait

一个 trait 可以包含多个方法：每个方法签名占据单独一行并以分号结尾。

### 孤儿规则

孤儿规则：只有当 trait 或类型定义于我们的库中时,我们才能为该类型实现对应的 trait。

```rust
pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

pub trait Summary {
    fn summarize(&self) -> String;
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}
```

### 默认实现

```rust
pub trait Summary {
    fn summarize(&self) -> String {
        String::from("(Read more...)")
    }
}

impl Summary for NewsArticle {}
```

> 无法在重载方法实现的过程中调用该方法的默认实现

### trait 约束

参数 item 可以是任何实现了 Summary trait 的类型

```rust
pub fn notify(item: impl Summary + Display) {
    println!("Breaking news! {}", item.summarize());
}
pub fn notify<T: Summary + Display>(item: T) {
    println!("Breaking news! {}", item.summarize());
}

fn returns_summarizable() -> impl Summary {}
```

### where 从句

```rust
fn some_function<T, U>(t: T, u: U) -> i32
where
    T: Display + Clone,
    U: Clone + Debug,
{
    42
}
```

## 生命周期

生命周期的标注并不会改变任何引用的生命周期长度。

生命周期的参数名称必须以撇号(')开头,且通常使用全小写字符。

在这个签名中我们所表达的意思是:参数与返回值中的所有引用都必须拥有相同的生命周期

泛型生命周期'a 会被具体化为 x 与 y 两者中生命周期较**短**的那一个

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

### 结构体定义中的生命周期标注

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

impl<'a> ImportantExcerpt<'a> {
    fn level(&self) -> i32 {
        3
    }
}
```

### 编译器生命周期计算规则

1. 每一个引用参数都会拥有自己的生命周期参数
2. 当只存在一个输入生命周期参数时,这个生命周期会被赋予给所有输出生命周期参数
3. 当拥有多个输入生命周期参数,而其中一个是&self 或&mut self 时,self 的生命周期会被赋予给所有的输出生命周期参数

### 静态生命周期

特殊的生命周期'static,它表示整个程序的执行期。所有的字符串字面量都拥有'static 生命周期

```rust
let s: &'static str = "I have a static lifetime.";
```

### 例子

```rust
fn longest_with_an_announcement<'a, T>(x: &'a str, y: &'a str, ann: T) -> &'a str
where
    T: Display,
{
    println!("Announcement! {}", ann);
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

# 编写自动化测试

`cargo new name --lib` 会自动创建一个测试模块，在需要测试的函数上一行用`#[test]`标注。

运行测试：`cargo test`

## 宏

`assert!` 接受一个 bool 值

`assert_eq!` 判断相等

`assert_ne!` 判断不等

通过在自定义的结构体或枚举的定义的上方添加#\[derive(PartialEq, Debug)\]标注来自动实现这两个 trait

`assert!(bool, "custom msg: {}", msg);`

`should_panic` 标记了这个属性的测试函数会在代码发生 panic 时顺利通过,而在代码不发生 panic 时执行失败。

`expected` 参数：检查 panic 发生时输出的错误提示信息是否包含了指定的文字。

```rust
#[test]
#[should_panic]
// or
#[should_panic(expected = "something should be contained in fn panic info")]
fn will_panic() {
	// something
}
```

## 使用 Result<T, E>编写测试

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() -> Result<(), String> {
        if 2 + 2 == 4 {
            Ok(())
        } else {
            Err(String::from("two plus two does not equal four"))
        }
    }
}
```

## 控制测试运行方式

Rust 会默认使用多线程来并行执行测试

控制测试运行线程数：`cargo test -- --test-threads=1`

测试通过时，默认不打印 print 的值，要在测试通过时打印值：`cargo test -- --nocapture`

运行单个测试：`cargo test one_hundred` 将只测试 one_hundred 函数

`cargo test add` 测试所有名称包含 add 的函数

### 忽略指定测试

1. 函数上一行添加 `#[ignore]`
2. `cargo test` 进行测试所有未标记 ignore 函数
3. `cargo test -- --ignored` 测试所有标记了 ignore 的函数

## 单元测试

约定俗成地在每个源代码文件中都新建一个 tests 模块来存放测试函数,并使用 cfg(test)对该模块进行标注。

在 tests 模块上标注#[cfg(test)]可以让 Rust 只在执行 cargo test 命令时编译和运行该部分测试代码,而在执行 cargo build 时剔除它们。

## 集成测试

集成测试完全位于代码库之外。在项目根目录下创建 tests 文件夹,它和 src 文件夹并列。

```rust
# adder/tests/integration_test.rs
use adder;

#[test]
fn it_adds_two() {
    assert_eq!(4, adder::add_two(2));
}
```

运行测试：`cargo test`

运行指定集成测试文件下所有测试函数：`cargo test --test integration_test`

为了避免 common 出现在测试结果中，可以创建 tests/common/mod.rs，而不再创建 tests/common.rs。tests 子目录中的文件不会被视作单独的包进行编译，更不会在测试输出中拥有自己的区域。

如果我们的项目是一个只有 src/main.rs 文件而没有 src/lib.rs 文件的二进制包,那么我们就无法在 tests 目录中创建集成测试,也无法使用 use 语句将 src/main.rs 中定义的函数导入作用域。只有代码包(library crate)才可以将函数暴露给其他包来调用,而二进制包只被用于独立执行。

把逻辑编写在 src/lib.rs 文件中，只在 src/main.rs 文件中进行简单调用。

# 迭代器与闭包

Rust 中的闭包是一种可以存入变量或作为参数传递给其他函数的匿名函数。我们希望在程序中将代码定义在一处,但只在真正需要结果时才执行相关代码。而这正是闭包的用武之地!

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let simulated_random_number = 7;

    let expensive_closure = |num| {
        println!("calculating slowly...");
        thread::sleep(Duration::from_secs(2));
        num
    };
    let result = expensive_closure(simulated_random_number);
    println!("{}", result)
}
```

## 使用泛型参数和 Fn trait 来存储闭包

记忆化 (memoization)或 惰性求值 (lazy evaluation)：创建一个同时存放闭包及闭包返回值的结构体。这个结构体只会在我们需要获得结果值时运行闭包,并将首次运行闭包时的结果缓存起来。

```rust
fn main() {
    let simulated_random_number = 7;
    let mut expensive_result = Cacher::new(|num| {
        println!("calculating slowly...");
        thread::sleep(Duration::from_secs(2));
        num
    });
    let result = expensive_result.value(simulated_random_number);
    println!("{result}");
}

struct Cacher<T>
where
    T: Fn(u32) -> u32,
{
    calculation: T,
    value: Option<u32>,
}

impl<T> Cacher<T>
where
    T: Fn(u32) -> u32,
{
    fn new(calculation: T) -> Cacher<T> {
        Cacher {
            calculation,
            value: None,
        }
    }
    fn value(&mut self, arg: u32) -> u32 {
        match self.value {
            Some(v) => v,
            None => {
                let v = (self.calculation)(arg);
                self.value = Some(v);
                v
            }
        }
    }
}
```

闭包可以捕获自己所在的环境并访问自己被定义时的作用域中的变量。

```rust
let x = 4;
let equal_to_x = |z| z == x;
let y = 4;
assert!(equal_to_x(y));
```

闭包可以通过 3 种方式从它们的环境中捕获值,这和函数接收参数的 3 种方式是完全一致的:获取所有权、可变借用及不可变借用。这 3 种方式被分别编码在如下所示的 3 种 Fn 系列的 trait 中:

- FnOnce 意味着闭包可以从它的封闭作用域中,也就是闭包所处的环境 中,消耗捕获的变量。为了实现这一功能,闭包必须在定义时取得这些变量的所有权并将它们移动至闭包中。这也是名称 FnOnce 中 Once 一词的含义:因为闭包不能多次获取并消耗掉同一变量的所有权,所以它只能被调用一次。
- FnMut 可以从环境中可变地借用值并对它们进行修改。
- Fn 可以从环境中不可变地借用值。

假如你希望强制闭包获取环境中值的所有权,那么你可以在参数列表前添加 move 关键字。这个特性在把闭包传入新线程时相当有用,它可以将捕获的变量一并移动到新线程中去。

```rust
fn main() {
    let x = vec![1, 2, 3];
    let equal_to_x = move |z| z == x;
    println!("can't use x here: {:?}", x);
    let y = vec![1, 2, 3];
    assert!(equal_to_x(y));
}
```

## 迭代器

```rust
let v = vec![1, 2, 3, 4];
let mut mv = vec![1, 2, 3, 4];
for i in &v { // same as v.iter()
	println!("{}", i);
}
for i in &mut mv { // same as v.iter_mut()
	*i += 50;
}
for i in &mut mv {
	println!("{}", i);
}

// 相当于 v.into_iter() 会发生值移动
for i in v {

}
```

```rust
let v1: Vec<i32> = vec![1, 2, 3];
let v2: Vec<_> = v1.iter().map(|x| x + 1).collect();

// into_iter 取得所有权，filter 取得引用
v2.into_iter().filter(|x| *x > 2).for_each(|f| {
	println!("{}", f);
});
```

## 使用 Iterator trait 来创建自定义迭代器

```rust
struct Counter {
    count: u32,
}

impl Counter {
    fn new() -> Counter {
        Counter { count: 0 }
    }
}

impl Iterator for Counter {
    type Item = u32;
    fn next(&mut self) -> Option<Self::Item> {
        self.count += 1;
        if self.count < 6 {
            Some(self.count)
        } else {
            None
        }
    }
}

    let sum: u32 = Counter::new()
        .zip(Counter::new().skip(1))
        .map(|(a, b)| a * b)
        .filter(|x| x % 3 == 0)
        .sum();
```

# cargo 配置

```toml
# cargo.toml
[profile.dev]
opt-level = 0

[profile.release]
opt-level = 3

[package]
name = "guessing_game"
version = "0.1.0"
authors = ["Your Name <you@example.com>"]
edition = "2018"
description = "A fun game where you guess what number the computer has chosen."
license = "MIT OR Apache-2.0"

[dependencies]
```

## 文档注释

使用三斜线(///)而不是双斜线来编写文档注释,并且可以在文档注释中使用 Markdown 语法来格式化内容。使用`//!`编写整个包的文档注释。

文档注释区域包含：

```text
# Examples
# Panics 指出函数可能引发panic的场景
# Errors 可能发生的错误
# Safety 函数不安全的原因
```

# 工作空间

## 创建

1. mkdir add; cd add
2. vi Cargo.toml

```toml
[workspace]

members = [
  "adder",
]
```

3. cargo new adder
4. members 中加入 "add-one"
5. cargo new add-one --lib
6. 编写依赖：

```toml
# adder/Cargo.toml
[dependencies]
add-one = { path = "../add-one" }
```

7. 运行：cargo run -p adder

> 虽然当前的工作空间已经引用了 rand,但工作空间内其余的包依然不能直接使用它,除非我们将 rand 添加到这些包对应的 Cargo.toml 中去。

# 智能指针

## 使用 Box\<T\>在堆上分配数据

```rust
let b = Box::new(4);
println!("{b}");
```

装箱被释放的东西除了有存储在栈上的指针,还有它指向的那些堆数据。

## 使用装箱定义递归类型

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}

use crate::List::{Cons, Nil};

fn main() {
    let list = Cons(1,
        Box::new(Cons(2,
            Box::new(Cons(3,
                Box::new(Nil))))));
}
```

## 通过Deref trait将智能指针视作常规引用

实现Deref trait可以使自定义类型能够解引用。

```rust
use std::ops::Deref;

struct MyBox<T>(T);
impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

impl<T> Deref for MyBox<T> {
    type Target = T;
    fn deref(&self) -> &T {
        &self.0
    }
}

fn main() {
    let x = 5;
    let y = MyBox::new(5);
    assert_eq!(5, *y);
}
```

## 解引用转换与可变性

Rust会在类型与trait满足下面3种情形时执行解引用转换:
• 当T: Deref<Target=U>时,允许&T转换为&U。
• 当T: DerefMut<Target=U>时,允许&mut T转换为&mut U。
• 当T: Deref<Target=U>时,允许&mut T转换为&U。

## 借助Drop trait在清理时运行代码

```rust
struct CustomSmartPointer {
    data: String,
}

impl Drop for CustomSmartPointer {
    fn drop(&mut self) {
        println!("Dropping CustomSmartPointer with data `{}`!", self.data)
    }
}

fn main() {
    let c = CustomSmartPointer {
        data: String::from("my stuff"),
    };
    let d = CustomSmartPointer {
        data: String::from("other stuff"),
    };
    println!("CustomSmartPointers created.");
}
```

## 使用std::mem::drop提前丢弃值

```rust
let c = CustomSmartPointer {
	data: String::from("my stuff"),
};
drop(c);
```

## 基于引用计数的智能指针Rc\<T\>

可以将Rc\<T\>想象成客厅中的电视。在第一个人进入客厅并打开电视后,其余所有进入的人就都可以直接观看电视。电视会一直保持开启状态并在最后一个人离开时关闭,因为我们不再需要使用电视了。

## 使用Rc\<T\>共享数据

```rust
enum List {
    Cons(i32, Rc<List>),
    Nil,
}

use crate::List::{Cons, Nil};
use std::rc::Rc;

fn main() {
    let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));
    println!("count after a = {}", Rc::strong_count(&a));
    let b = Cons(3, Rc::clone(&a));
    println!("count after b = {}", Rc::strong_count(&a));
    {
        let c = Cons(4, Rc::clone(&a));
        println!("count after c = {}", Rc::strong_count(&a));
    }
    println!("count after c goes out of scope = {}", Rc::strong_count(&a));
}
```

## RefCell\<T\>和内部可变性模式

内部可变性 (interior mutability)是Rust的设计模式之一,它允许你在只持有不可变引用的前提下对数据进行修改.

## 使用RefCell\<T\>在运行时检查借用规则

对于使用一般引用和Box\<T\>的代码,Rust会在编译阶段强制代码遵守这些借用规则。而对于使用RefCell\<T\>的代码,Rust则只会在运行时检查这些规则,并在出现违反借用规则的情况下触发panic来提前中止程序。

## 选择使用Box\<T\>、Rc\<T\>还是RefCell\<T\>的依据:

- Rc\<T>允许一份数据有多个所有者,而Box\<T>和RefCell\<T>都只有一个所有者。
- Box\<T>允许在编译时检查的可变或不可变借用,Rc\<T>仅允许编译时检查的不可变借用,RefCell\<T>允许运行时检查的可变或不可变
  借用。
- 由于RefCell\<T>允许我们在运行时检查可变借用,所以即便RefCell\<T>本身是不可变的,我们仍然能够更改其中存储的值。

```rust
use std::cell::RefCell;

struct Person {
    age: RefCell<u32>,
}
impl Person {
    pub fn new() -> Person {
        Person { age: 12.into() }
    }
    pub fn set_age(&self, age: u32) {
        *self.age.borrow_mut() = age;
    }
}

fn main() {
    let person = Person::new();
    person.set_age(10);
    println!("{}", person.age.borrow());
    let mut borrow2 = person.age.borrow_mut();
    *borrow2 = 2;
}
```

## 循环引用会造成内存泄漏

```rust
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug)]
enum List {
    Cons(i32, RefCell<Rc<List>>),
    Nil,
}

impl List {
    fn tail(&self) -> Option<&RefCell<Rc<List>>> {
        match self {
            Cons(_, item) => Some(item),
            Nil => None,
        }
    }
}

use List::{Cons, Nil};
fn main() {
    let a = Rc::new(Cons(5, RefCell::new(Rc::new(Nil))));

    println!("a initial rc count = {}", Rc::strong_count(&a));
    println!("a next item = {:?}", a.tail());

    let b = Rc::new(Cons(10, RefCell::new(Rc::clone(&a))));

    println!("a rc count after b creation = {}", Rc::strong_count(&a));
    println!("b initial rc count = {}", Rc::strong_count(&b));
    println!("b next item = {:?}", b.tail());

    if let Some(link) = a.tail() {
        *link.borrow_mut() = Rc::clone(&b);
    }

    println!("b rc count after changing a = {}", Rc::strong_count(&b));
    println!("a rc count after changing a = {}", Rc::strong_count(&a));

    println!("a next item = {:?}", a.tail());
}
```

## 使用Weak\<T>代替Rc\<T>来避免循环引用

使用Rc\<T>的引用来调用Rc::downgrade函数会返回一个类型为Weak\<T>的智能指针,这一操作会让Rc\<T>中weak_count的计数增加1,而不会改变strong_count的状态。

由于我们无法确定Weak\<T>引用的值是否已经被释放了,所以我们需要在使用Weak\<T>指向的值之前确保它依然存在。调用Weak\<T>实例的upgrade方法来完成这一验证。

```rust
use std::cell::RefCell;
use std::rc::{Rc, Weak};

#[derive(Debug)]
struct Node {
    value: i32,
    children: RefCell<Vec<Rc<Node>>>,
    parent: RefCell<Weak<Node>>,
}

fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        children: RefCell::new(vec![]),
        parent: RefCell::new(Weak::new()),
    });
    println!("leaf parent: {:?}", leaf.parent.borrow().upgrade());
    let branch = Rc::new(Node {
        value: 5,
        children: RefCell::new(vec![Rc::clone(&leaf)]),
        parent: RefCell::new(Weak::new()),
    });
    *leaf.parent.borrow_mut() = Rc::downgrade(&branch);
    println!("leaf parent: {:?}", leaf.parent.borrow().upgrade());
}
```

# 并发

## 使用spawn创建新线程

只要程序中的主线程运行结束,创建出的新线程就会相应停止,而不管它的任务是否完成。

## 用join句柄等待所有线程结束

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("spawn: {}", i);
            thread::sleep(Duration::from_millis(1));
        }
    });
    for i in 1..5 {
        println!("main: {}", i);
        thread::sleep(Duration::from_millis(1));
    }
    handle.join().unwrap();
}
```

## 在线程中使用move闭包

> 解决 closure may outlive the current function

```rust
use std::thread;

fn main() {
    let v = vec![1, 2, 3];
    let handle = thread::spawn(move || {
        println!("{:?}", v);
    });
    handle.join().unwrap();
}
```

## 使用消息传递在线程间转移数据

> multiple producer, single consumer

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
    });
    let received = rx.recv().unwrap(); // 阻塞主线程直到接收到值
    println!("Got: {}", received);
}
```

> try_recv方法不会阻塞线程,它会立即返回Result<T, E>, 当通道中存在消息时,返回包含该消息的Ok变体;否则便返回Err变体。

## 通道和所有权转移

send函数会获取参数的所有权,并在参数传递时将所有权转移给接收者。

## 发送多个值并观察接收者的等待过程

```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];
        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });
    for received in rx {
        println!("Got: {}", received);
    }
}
```

## 通过克隆发送者创建多个生产者

`let tx1 = mpsc::Sender::clone(&tx);`

## 共享状态的并发

### 互斥体一次只允许一个线程访问数据

互斥体（mutex）两条规则：

- 必须在使用数据前尝试获取锁
- 必须在使用完互斥体守护的数据后释放锁

### Mutex\<T>

```rust
use std::sync::Mutex;
fn main() {
    let m = Mutex::new(3);
    {
        let mut num = m.lock().unwrap();
        *num = 6;
    }
    // = drop(num);
    println!("m={:?}", m);
}
```

> `lock()`会阻塞当前线程直到我们取得锁为止
> 内部作用域结尾处自动释放锁

### 在多个线程间共享Mutex\<T>

> `Rc`指针无法在线程间安全地传递，需使用原子引用计数`Arc<T>`
> `Mutex<T>`提供了内部可变性

```rust
use std::sync::Arc;
use std::sync::Mutex;
use std::thread;

fn main() {
    let count = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    for _ in 1..=10 {
        let count = Arc::clone(&count);
        let handle = thread::spawn(move || {
            let mut num = count.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }
    for h in handles {
        h.join().unwrap();
    }
    println!("count: {}", *count.lock().unwrap());
}
```

## 使用Sync trait和Send trait对并发进行扩展

### 允许线程间转移所有权的Send trait

> 只有实现了Send trait的类型才可以安全地在线程间转移所有权
> 任何完全由Send类型组成的复合类型都会被自动标记为Send

### 允许多线程同时访问的Sync trait

> 只有实现了Sync trait的类型才可以安全地被多个线程引用
> 对于任何类型T,如果&T(也就是T的引用)满足约束Send,那么T就是满足Sync的
> 所有原生类型都满足Sync约束,而完全由满足Sync的类型组成的复合类型也都会被自动识别为满足Sync的类型
> 💡手动实现Send和Sync是不安全的

# Rust的面向对象编程特性

## 为共有行为定义一个trait

`Box<dyn Draw>` 被用来代表所有被放置在Box中且实现了Draw trait的具体类型。

```rust
pub trait Draw {
    fn draw(&self);
}

pub struct Screen {
    pub components: Vec<Box<dyn Draw>>,
}

impl Screen {
    pub fn run(&self) {
        for components in self.components.iter() {
            components.draw();
        }
    }
}

pub struct Screen<T: Draw> {
    pub components: Vec<T>,
}

impl<T> Screen<T>
    where T: Draw {
        pub fn run(&self) {
            for components in self.components.iter() {
                components.draw();
            }
        }
    }
```

`Box<dyn Draw>` 是一个trait对象，是 `Box` 中任何实现了 `Draw` trait 的类型的替身。

```rust
fn main() {
    let screen = Screen {
        components: vec![
            Box::new(SelectBox {
                width: 75,
                height: 10,
                options: vec![String::from("yes"), String::from("No")],
            }),
            Box::new(Button {
                width: 50,
                height: 10,
                label: String::from("OK"),
            }),
        ],
    };
    screen.run();
}
```

## trait对象会执行动态派发

单态化:编译器会为每一个具体类型生成对应泛型函数和泛型方法的非泛型实现,并使用这些具体的类型来替换泛型参数。

通过单态化生成的代码会执行静态派发(static dispatch),这意味着编译器能够在编译过程中确定你调用的具体方法。

Rust必然会在我们使用trait对象时执行动态派发。因为编译器无法知晓所有能够用于trait对象的具体类型,所以它无法在编译时确定需要调用哪个类型的哪个具体方法。会产生一些不可避免的运行时开销，还会阻止编译器内联代码,进而使得部分优化操作无法进行。

## trait对象必须保证对象安全

对象安全需满足两条规则：

1. 方法的返回类型不是Self
2. 方法中不包含任何泛型参数

```
error[E0038]: the trait `Clone` cannot be made into an object
  --> src/main.rs:36:29
   |
36 |     pub components: Vec<Box<dyn Clone>>
   |                             ^^^^^^^^^ `Clone` cannot be made into an object
   |
   = note: the trait cannot be made into an object because it requires `Self: Sized`
   = note: for a trait to be "object safe" it needs to allow building a vtable to allow the call to be resolvable dynamically; for more information visit <https://doc.rust-lang.org/reference/items/traits.html#object-safety>
```

## 面向对象设计模式的实现

`self: Box<Self>` 意味着该方法只可在持有这个类型的 `Box` 上被调用

为了消费老状态，`request_review` 方法需要获取状态值的所有权。这就是 `Post` 的 `state` 字段中 `Option` 的来历：调用 `take` 方法将 `state` 字段中的 `Some` 值取出并留下一个 `None`，因为 Rust 不允许结构体实例中存在值为空的字段。这使得我们将 `state` 的值移出 `Post` 而不是借用它。接着我们将博文的 `state` 值设置为这个操作的结果。

```rust
pub struct Post {
    state: Option<Box<dyn State>>,
    content: String,
}

impl Post {
    pub fn new() -> Post {
        Post {
            state: Some(Box::new(Draft {})),
            content: String::new(),
        }
    }
    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }
    pub fn content(&self) -> &str {
        self.state.as_ref().unwrap().content(self)
    }
    pub fn request_review(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.request_review())
        }
    }
    pub fn approve(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.approve())
        }
    }
}

trait State {
    fn request_review(self: Box<Self>) -> Box<dyn State>;
    fn approve(self: Box<Self>) -> Box<dyn State>;
    fn content<'a>(&self, post: &'a Post) -> &'a str {
        ""
    }
}

struct Draft {}

impl State for Draft {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        Box::new(PendingReview {})
    }
    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }
}

struct PendingReview {}

impl State for PendingReview {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }
    fn approve(self: Box<Self>) -> Box<dyn State> {
        Box::new(Published {})
    }
}

struct Published {}

impl State for Published {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }
    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }
    fn content<'a>(&self, post: &'a Post) -> &'a str {
        &post.content
    }
}

use blog::Post;

fn main() {
    let mut post = Post::new();

    post.add_text("I ate a salad for lunch today");
    assert_eq!("", post.content());

    post.request_review();
    assert_eq!("", post.content());

    post.approve();
    assert_eq!("I ate a salad for lunch today", post.content());
}
```

## 状态编码进类型

```rust
pub struct Post {
    content: String,
}

pub struct DraftPost {
    content: String,
}

impl Post {
    pub fn new() -> DraftPost {
        DraftPost {
            content: String::new(),
        }
    }

    pub fn content(&self) -> &str {
        &self.content
    }
}

impl DraftPost {
    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }
    pub fn request_review(self) -> PendingReviewPost {
        PendingReviewPost {
            content: self.content,
        }
    }
}

pub struct PendingReviewPost {
    content: String,
}

impl PendingReviewPost {
    pub fn approve(self) -> Post {
        Post {
            content: self.content,
        }
    }
}

use blog::Post;

fn main() {
    let mut post = Post::new();
    post.add_text("I ate a salad for lunch today");
    let post = post.request_review();
    let post = post.approve();
    assert_eq!("I ate a salad for lunch today", post.content());
}
```

# 模式和匹配 模式匹配

## match分支

`_` 可以匹配所有情况，不过它从不绑定任何变量

```rust
match VALUE {
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
}
```

## if let条件表达式

```rust
fn main() {
    let favorite_color: Option<&str> = None;
    let is_tuesday = false;
    let age: Result<u8, _> = "34".parse();

    if let Some(color) = favorite_color {
        println!("Using your favorite color, {}, as the background", color);
    } else if is_tuesday {
        println!("Tuesday is green day!");
    } else if let Ok(age) = age {
        if age > 30 {
            println!("Using purple as the background color");
        } else {
            println!("Using orange as the background color");
        }
    } else {
        println!("Using blue as the background color");
    }
}
```

## while let条件循环

```rust
let mut stack = Vec::new()
stack.push(1);
stack.push(2);

while let Some(top) = stack.pop() {
	println("{}", top);
}
```

## for循环

```rust
let v = vec!['a', 'b', 'c'];

for (index, value) in v.iter().enumerate() {
    println!("{} is at index {}", value, index);
}
```

## let语句

```rust
let (x, y, z) = (1, 2, 3);
```

## 函数参数

```rust
fn print_coordinates(&(x, y): &(i32, i32)) {
    println!("Current location: ({}, {})", x, y);
}

fn main() {
    let point = (3, 5);
    print_coordinates(&point);
}
```

## Refutability（可反驳性）: 模式是否会匹配失效

模式有两种形式：refutable（可反驳的）和 irrefutable（不可反驳的）。能匹配任何传递的可能值的模式被称为是 **不可反驳的**（_irrefutable_）。一个例子就是 `let x = 5;` 语句中的 `x`，因为 `x` 可以匹配任何值所以不可能会失败。对某些可能的值进行匹配会失败的模式被称为是 **可反驳的**（_refutable_）。一个这样的例子便是 `if let Some(x) = a_value` 表达式中的 `Some(x)`；如果变量 `a_value` 中的值是 `None` 而不是 `Some`，那么 `Some(x)` 模式不能匹配。

## 模式语法

```rust
let x = 1;

match x {
	// or
    1 | 2 => println!("one or two"),
    3 => println!("three"),
    _ => println!("anything"),
}
```

```rust
let x = 5;

match x {
    1..=5 => println!("one through five"),
    _ => println!("something else"),
}
```

```rust
let x = 'c';

match x {
    'a'..='j' => println!("early ASCII letter"),
    'k'..='z' => println!("late ASCII letter"),
    _ => println!("something else"),
}
```

## 解构

```rust
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 0, y: 7 };

    let Point { x: a, y: b } = p;
    assert_eq!(0, a);
    assert_eq!(7, b);
}

// 简写
let Point { x, y } = p;
```

```rust
fn main() {
    let p = Point { x: 0, y: 7 };

    match p {
        Point { x, y: 0 } => println!("On the x axis at {}", x),
        Point { x: 0, y } => println!("On the y axis at {}", y),
        Point { x, y } => println!("On neither axis: ({}, {})", x, y),
    }
}
```

## 匹配嵌套的枚举

```rust
enum Color {
   Rgb(i32, i32, i32),
   Hsv(i32, i32, i32),
}

enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(Color),
}

fn main() {
    let msg = Message::ChangeColor(Color::Hsv(0, 160, 255));

    match msg {
        Message::ChangeColor(Color::Rgb(r, g, b)) => {
            println!(
                "Change the color to red {}, green {}, and blue {}",
                r,
                g,
                b
            )
        }
        Message::ChangeColor(Color::Hsv(h, s, v)) => {
            println!(
                "Change the color to hue {}, saturation {}, and value {}",
                h,
                s,
                v
            )
        }
        _ => ()
    }
}
```

```rust
let ((feet, inches), Point {x, y}) = ((3, 10), Point { x: 3, y: -10 });
```

`..` 模式会忽略模式中剩余的任何没有显式匹配的值部分

```rust
struct Point {
    x: i32,
    y: i32,
    z: i32,
}

let origin = Point { x: 0, y: 0, z: 0 };

match origin {
    Point { x, .. } => println!("x is {}", x),
}
```

## 匹配守卫

一个指定于 `match` 分支模式之后的额外 `if` 条件，它也必须被满足才能选择此分支。

```rust
let num = Some(4);

match num {
    Some(x) if x < 5 => println!("less than five: {}", x),
    Some(x) => println!("{}", x),
    None => (),
}
```

```rust
let x = 4;
let y = false;

match x {
	// (4 | 5 | 6) if y
    4 | 5 | 6 if y => println!("yes"),
    _ => println!("no"),
}
```

## @绑定

我们希望测试 `Message::Hello` 的 `id` 字段是否位于 `3..=7` 范围内，同时也希望能将其值绑定到 `id_variable` 变量中以便此分支相关联的代码可以使用它。可以将 `id_variable` 命名为 `id`，与字段同名。

```rust
enum Message {
    Hello { id: i32 },
}

let msg = Message::Hello { id: 5 };

match msg {
    Message::Hello { id: id_variable @ 3..=7 } => {
        println!("Found an id in range: {}", id_variable)
    },
    Message::Hello { id: 10..=12 } => {
        println!("Found an id in another range")
    },
    Message::Hello { id } => {
        println!("Found some other id: {}", id)
    },
}
```

# 高级特征

## 不安全Rust

有五类可以在不安全 Rust 中进行而不能用于安全 Rust 的操作：

- 解引用裸指针
- 调用不安全的函数或方法
- 访问或修改可变静态变量
- 实现不安全 trait
- 访问 `union` 的字段

`unsafe` 并不会关闭借用检查器或禁用任何其他 Rust 安全检查：如果在不安全代码中使用引用，它仍会被检查。`unsafe` 关键字只是提供了那五个不会被编译器检查内存安全的功能。

### 创建裸指针

```rust
let mut num = 5;

let r1 = &num as *const i32;
let r2 = &mut num as *mut i32;

let address = 0x12345usize;
let r = address as *const i32;
```

### 解引用裸指针

```rust
unsafe {
	println!("r1 is: {}", *r1);
}
```

通过裸指针，就能够同时创建同一地址的可变指针和不可变指针，若通过可变指针修改数据，则可能潜在造成数据竞争。请多加小心！

### 调用不安全函数或方法

```rust
unsafe fn dangerous() {}

fn main() {
    unsafe {
        dangerous();
    }
}
```

不安全函数体也是有效的 `unsafe` 块，所以在不安全函数中进行另一个不安全操作时无需新增额外的 `unsafe` 块。

### 创建不安全代码的安全抽象

```rust
fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = slice.len();
    let ptr = slice.as_mut_ptr();

    assert!(mid <= len);

    unsafe {
        (
            slice::from_raw_parts_mut(ptr, mid),
            slice::from_raw_parts_mut(ptr.add(mid), len - mid),
        )
    }
}
```

我们创建了一个不安全代码的安全抽象，其代码以一种安全的方式使用了 `unsafe` 代码，因为其只从这个函数访问的数据中创建了有效的指针。

### 使用 extern 函数调用外部代码

`extern` 块中声明的函数在 Rust 代码中总是不安全的。

`"C"` 部分定义了外部函数所使用的 **应用二进制接口**（_application binary interface_，ABI） —— ABI 定义了如何在汇编语言层面调用此函数。`"C"` ABI 是最常见的，并遵循 C 编程语言的 ABI。

```rust
extern "C" {
    fn abs(input: i32) -> i32;
}

fn main() {
    unsafe{
        println!("abs: {}", abs(-3));
    }
}
```

### 从其它语言调用 Rust 函数

也可以使用 `extern` 来创建一个允许其他语言调用 Rust 函数的接口。不同于 `extern` 块，就在 `fn` 关键字之前增加 `extern` 关键字并指定所用到的 ABI。还需增加 `#[no_mangle]` 标注来告诉 Rust 编译器不要 mangle 此函数的名称。_Mangling_ 发生于当编译器将我们指定的函数名修改为不同的名称时，这会增加用于其他编译过程的额外信息，不过会使其名称更难以阅读。每一个编程语言的编译器都会以稍微不同的方式 mangle 函数名，所以为了使 Rust 函数能在其他语言中指定，必须禁用 Rust 编译器的 name mangling。

```rust
#[no_mangle]
pub extern "C" fn call_from_c() {
    println!("Just called a Rust function from C!");
}

fn main() {
    unimplemented!();
}
```

### 访问或修改可变静态变量

```rust
static mut counter: u32 = 0;

fn add_to_count(inc: u32) {
    unsafe {
        counter += inc;
    }
}

fn main() {
    add_to_count(3);

    unsafe {
        println!("counter: {}", counter);
    }
}
```

### 实现不安全 trait

```rust
unsafe trait Foo {}

unsafe impl Foo for i32 {}
```

### 访问联合体中的字段

## 高级 trait

### 关联类型在 trait 定义中指定占位符类型

```rust
struct Counter {}

pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;
}

impl Iterator for Counter {
    type Item = u32;
    fn next(&mut self) -> Option<Self::Item> {
        unimplemented!();
    }
}
```

通过关联类型，则无需标注类型，因为不能多次实现这个 trait。

### 默认泛型类型参数和运算符重载

```rust
use std::ops::Add;

#[derive(Debug, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}

impl Add for Point {
    type Output = Point;
    fn add(self, other: Self) -> Self::Output {
        Point {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

fn main() {
    assert_eq!(
        Point { x: 1, y: 0 } + Point { x: 2, y: 3 },
        Point { x: 3, y: 3 }
    );
}
```

默认类型参数：`<RHS=Self>`

```rust
trait Add<RHS=Self> {
    type Output;

    fn add(self, rhs: RHS) -> Self::Output;
}
```

如果实现 `Add` trait 时不指定 `RHS` 的具体类型，`RHS` 的类型将是默认的 `Self` 类型

```rust
use std::ops::Add;

struct Millimeters(u32);
struct Meters(u32);

impl Add<Meters> for Millimeters {
    type Output = Millimeters;

    fn add(self, other: Meters) -> Millimeters {
        Millimeters(self.0 + (other.0 * 1000))
    }
}
```

### 完全限定语法与消歧义：调用相同名称的方法

当调用 `Human` 实例的 `fly` 时，编译器默认调用直接实现在类型上的方法

```rust
trait Pilot {
    fn fly(&self);
}

trait Wizard {
    fn fly(&self);
}

struct Human;

impl Pilot for Human {
    fn fly(&self) {
        println!("This is your captain speaking.");
    }
}

impl Wizard for Human {
    fn fly(&self) {
        println!("Up!");
    }
}

impl Human {
    fn fly(&self) {
        println!("*waving arms furiously*");
    }
}

fn main() {
    let person = Human;
    Pilot::fly(&person);
    Wizard::fly(&person);
    person.fly();
}

// This is your captain speaking.
// Up!
// *waving arms furiously*
```

如果有两个 **类型** 都实现了同一 **trait**，Rust 可以根据 `self` 的类型计算出应该使用哪一个 trait 实现

```rust
trait Animal {
    fn baby_name() -> String;
}

struct Dog;

impl Dog {
    fn baby_name() -> String {
        String::from("Spot")
    }
}

impl Animal for Dog {
    fn baby_name() -> String {
        String::from("puppy")
    }
}

fn main() {
    println!("A baby dog is called a {}", Dog::baby_name());
}

// A baby dog is called a Spot
```

```rust
println!("A baby dog is called a {}", <Dog as Animal>::baby_name());
// A baby dog is called a puppy
```

完全限定语法：

```rust
<Type as Trait>::function(receiver_if_method, next_arg, ...);
```

### 父 trait 用于在另一个 trait 中使用某 trait 的功能

```rust
use std::fmt;

trait OutlinePrint: fmt::Display {
    fn outline_print(&self) {
        let output = self.to_string();
        let len = output.len();
        println!("{}", "*".repeat(len + 4));
        println!("*{}*", " ".repeat(len + 2));
        println!("* {} *", output);
        println!("*{}*", " ".repeat(len + 2));
        println!("{}", "*".repeat(len + 4));
    }
}
```

```rust
struct Point {
    x: i32,
    y: i32,
}

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

impl OutlinePrint for Point {}

fn main() {
    OutlinePrint::outline_print(&Point { x: 1, y: 2 });
}
```

[[#孤儿规则]]，绕开这个限制的方法是使用 **newtype 模式**

它涉及到在一个元组结构体中创建一个新类型。这个元组结构体带有一个字段作为希望实现 trait 的类型的简单封装。接着这个封装类型对于 crate 是本地的，这样就可以在这个封装上实现 trait。_Newtype_ 是一个源自 Haskell 编程语言的概念。使用这个模式没有运行时性能消耗，这个封装类型在编译时就被省略了。

```rust
struct Wrapper(Vec<String>);

impl fmt::Display for Wrapper {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

fn main() {
    let w = Wrapper(vec![String::from("hello"), String::from("world")]);
    println!("w = {}", w);
}
```

## 高级类型

### 类型别名

```rust
type Kilometers = i32;
let x: i32 = 5;
let y: Kilometers = 5;

type Thunk = Box<dyn Fn() + Send + 'static>;
let f: Thunk = Box::new(|| println!("Hi"));

// std::io中有：
type Result<T> = std::result::Result<T, std::io::Error>;
```

### 从不返回的 never type

叫做 `!` 的特殊类型，被称为 _empty type_，因为它没有值，在函数从不返回的时候充当返回值

```rust
let guess: u32 = match guess.trim().parse() {
    Ok(num) => num,
    Err(_) => continue,
};
```

当 Rust 要计算 `guess` 的类型时，它查看这两个分支。前者是 `u32` 值，而后者是 `!` 值。因为 `!` 并没有一个值，Rust 决定 `guess` 的类型是 `u32`。

描述 `!` 的行为的正式方式是 never type 可以强转为任何其他类型。允许 `match` 的分支以 `continue` 结束是因为 `continue` 并不真正返回一个值；相反它把控制权交回上层循环，所以在 `Err` 的情况，事实上并未对 `guess` 赋值。

### 动态大小类型和 Sized trait

```rust
// 无法编译
let s1: str = "Hello there!";
let s2: str = "How's it going?";
```

Rust 需要知道应该为特定类型的值分配多少内存，同时所有同一类型的值必须使用相同数量的内存。

所以虽然 `&T` 是一个储存了 `T` 所在的内存位置的单个值，`&str` 则是 **两个** 值：`str` 的地址和其长度。这样，`&str` 就有了一个在编译时可以知道的大小：它是 `usize` 长度的两倍。也就是说，我们总是知道 `&str` 的大小，而无论其引用的字符串是多长。这里是 Rust 中动态大小类型的常规用法：他们有一些额外的元信息来储存动态信息的大小。这引出了动态大小类型的黄金规则：必须将动态大小类型的值置于某种指针之后。

每一个 trait 都是一个可以通过 trait 名称来引用的动态大小类型。

泛型函数默认只能用于在编译时已知大小的类型。然而可以使用如下特殊语法来放宽这个限制：

```rust
fn generic<T: ?Sized>(t: &T) {
    // --snip--
}
```

`?Sized` trait bound 与 `Sized` 相对；也就是说，它可以读作 “`T` 可能是也可能不是 `Sized` 的”。这个语法只能用于 `Sized` ，而不能用于其他 trait。

另外注意我们将 `t` 参数的类型从 `T` 变为了 `&T`：因为其类型可能不是 `Sized` 的，所以需要将其置于某种指针之后。

## 高级函数与闭包

### 函数指针

函数的类型是 `fn` （使用小写的 “f” ）以免与 `Fn` 闭包 trait 相混淆。`fn` 被称为 **函数指针**（_function pointer_）。

```rust
fn add_one(x: i32) -> i32 {
    x + 1
}

fn do_twice(f:fn(i32)->i32, arg: i32) ->i32 {
    f(arg) + f(arg)
}

fn main() {
    let answer = do_twice(add_one, 5);
    println!("The answer is: {}", answer);
}
```

函数指针实现了所有三个闭包 trait（`Fn`、`FnMut` 和 `FnOnce`），所以总是可以在调用期望闭包的函数时传递函数指针作为参数。倾向于编写使用泛型和闭包 trait 的函数，这样它就能接受函数或闭包作为参数。

```rust
fn main() {
    let list_of_numbers = vec![1, 2, 3];
    let list_of_strings: Vec<String> = list_of_numbers.iter().map(|i| i.to_string()).collect();
    let list_of_strings: Vec<String> = list_of_numbers.iter().map(ToString::to_string).collect();
}
```

```rust
enum Status {
    Value(u32),
    Stop,
}

let list_of_statuses: Vec<Status> = (0u32..20).map(Status::Value).collect();
```

### 返回闭包

```rust
fn returns_closure() -> Box<dyn Fn(i32) -> i32> {
    Box::new(|x| x + 1)
}

fn main() {
    let f = returns_closure();
    println!("{}", f(1));
}
```

## [宏](https://rustwiki.org/zh-CN/book/ch19-06-macros.html)

[参考](https://rustwiki.org/zh-CN/reference/macros.html)

**宏**（_Macro_）指的是 Rust 中一系列的功能：使用 `macro_rules!` 的 **声明**（_Declarative_）宏，和三种 **过程**（_Procedural_）宏：

- 自定义 `#[derive]` 宏在结构体和枚举上指定通过 `derive` 属性添加的代码
- 类属性（Attribute-like）宏定义可用于任意项的自定义属性
- 类函数宏看起来像函数不过作用于作为参数传递的 token

### 使用 macro_rules! 的声明宏用于通用元编程

其核心概念是，声明宏允许我们编写一些类似 Rust `match` 表达式的代码。

```rust
#[macro_export]
macro_rules! vec {
    ( $( $x:expr ),* ) => {
        {
            let mut temp_vec = Vec::new();
            $(
                temp_vec.push($x);
            )*
            temp_vec
        }
    };
}
```

`#[macro_export]` 标注说明，只要将定义了宏的 crate 引入作用域，宏就应当是可用的。如果没有该标注，这个宏就不能被引入作用域。

### 用于从属性生成代码的过程宏

有三种类型的过程宏（自定义派生（derive），类属性和类函数），不过它们的工作方式都类似。

#### 过程宏

```rust
#[derive(HelloMacro)]
struct Pancakes;
```

#### 类属性宏

不同于为 `derive` 属性生成代码，它们允许你创建新的属性

```rust
#[route(GET, "/")]
fn index() {}
```

```rust
#[proc_macro_attribute]
pub fn route(attr: TokenStream, item: TokenStream) -> TokenStream {
```

这里有两个 `TokenStream` 类型的参数；第一个用于属性内容本身，也就是 `GET, "/"` 部分。第二个是属性所标记的项：在本例中，是 `fn index() {}` 和剩下的函数体。

#### 类函数宏

类函数宏获取 `TokenStream` 参数，其定义使用 Rust 代码操纵 `TokenStream`

```rust
let sql = sql!(SELECT * FROM posts WHERE id=1);
```

```rust
#[proc_macro]
pub fn sql(input: TokenStream) -> TokenStream {}
```

# 其他

可以在项目目录使用 `rustup override` 来设置当前目录 `rustup` 使用 nightly 工具链：

```shell
cd ~/projects/needs-nightly
rustup override set nightly
```

## Converting between different String types in Rust

```rust
let s: String = ...
let st: &str = ...
let u: &[u8] = ...
let b: [u8; 3] = b"foo"
let v: Vec<u8> = ...
let os: OsString = ...
let ost: OsStr = ...

From       To         Use                                    Comment
----       --         ---                                    -------
&str     -> String    String::from(st)
&str     -> &[u8]     st.as_bytes()
&str     -> Vec<u8>   st.as_bytes().to_owned()               via &[u8]
&str     -> &OsStr    OsStr::new(st)

String   -> &str      &s                                     alt. s.as_str()
String   -> &[u8]     s.as_bytes()
String   -> Vec<u8>   s.into_bytes()
String   -> OsString  OsString::from(s)

&[u8]    -> &str      str::from_utf8(u).unwrap()
&[u8]    -> String    String::from_utf8(u).unwrap()
&[u8]    -> Vec<u8>   u.to_owned()
&[u8]    -> &OsStr    OsStr::from_bytes(u)                   use std::os::unix::ffi::OsStrExt;

[u8; 3]  -> &[u8]     &b[..]                                 byte literal
[u8; 3]  -> &[u8]     "foo".as_bytes()                       alternative via utf8 literal

Vec<u8>  -> &str      str::from_utf8(&v).unwrap()            via &[u8]
Vec<u8>  -> String    String::from_utf8(v)
Vec<u8>  -> &[u8]     &v
Vec<u8>  -> OsString  OsString::from_vec(v)                  use std::os::unix::ffi::OsStringExt;

&OsStr   -> &str      ost.to_str().unwrap()
&OsStr   -> String    ost.to_os_string().into_string()       via OsString
                         .unwrap()
&OsStr   -> Cow<str>  ost.to_string_lossy()                  Unicode replacement characters
&OsStr   -> OsString  ost.to_os_string()
&OsStr   -> &[u8]     ost.as_bytes()                         use std::os::unix::ffi::OsStringExt;

OsString -> String    os.into_string().unwrap()              returns original OsString on failure
OsString -> &str      os.to_str().unwrap()
OsString -> &OsStr    os.as_os_str()
OsString -> Vec<u8>   os.into_vec()                          use std::os::unix::ffi::OsStringExt;
```

## 交叉编译

### 手动

查看当前平台：`rustc -vV`

列出所有toolchain：`rustup target list`

安装对应toolchain：`rustup target add aarch64-linux-android`

编辑：`/projects/.cargo/config.toml`

```toml
[build]
target = "aarch64-linux-android"

[target.aarch64-linux-android]
linker = "aarch64-linux-android29-clang"
```

### 自动

```sh
cargo install cross
sudo pacman -S podman
sudo systemctl start podman.service
cross build --target aarch64-linux-android
cross rustc --target powerpc-unknown-linux-gnu --release -- -C lto
```
