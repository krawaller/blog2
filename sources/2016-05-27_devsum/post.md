---
url: "devsum-cyclejs"
id: devsum
type: post
title: "Devsum CycleJS"
date: 2016-05-27
tags: [cyclejs, rxjs]
author: david
excerpt: Slides from and retrospective on my CycleJS talk at Devsum
draft: false
---

Today I spoke at the [Devsum](devsum.se) conference about the [CycleJS](http://cycle.js.org) library, with an [RxJS](http://) prelude. As a JS and frontend evangelist I was a bit wary to come to a .NET conference, but it turned out they had lots of great web content!

Below you can peruse the slides to the talk. You can also view them standalone [here](http://blog.krawaller.se/cycleslides).

No guarantees as to how much sense they make without me yapping along, but here are two pointers:

- The **stream demos** (horisontal blueish sausages) are live, and starts when you click on them. Their `id` is displayed to the left and their source code to the right. The code might contain references to other streams, and also uses some abbreviations (like `Obs` instead of `Rx.Observable`).

- The **app demos** (grey boxes) are live interactive CycleJS apps. Their source isn't immediately available, but is always discussed piecemeal in the surrounding slides.

<iframe src="https://blog.krawaller.se/cycleslides" height="500px" width="100%"></iframe>

Finally, if you find functional (reactive) programming interesting but haven't yet tried to play with CycleJS (or streams), definitely go do so!

Even though Cycle's maturity and practical use can definitely be put into question, taking Cycle for a test drive is an intriguing experience that will increase your perspective on coding in general! Or else your money back.
