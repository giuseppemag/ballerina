---
marp: true

---

<!-- theme: gaia -->
<style>
  @font-face {
    font-family: "Apercu";
    src: url(https://legacy.grandeomega.com/css/fonts/Apercu-Mono.ttf) format("truetype");
  }

  :root {
    /* --color-background: #487ced;
    --color-foreground: #ffedf5;
    --color-highlight: #ffedf5;
    --color-dimmed: #ffedf5; */
    /* --color-background: #083d34;
    --color-foreground: #e3e8e7;
    --color-highlight: #35a674;
    --color-dimmed: #35a674; */

--color-background: #3A36AE;
    --color-foreground: #FCEEF5;
    --color-highlight: #E0569B;
    --color-dimmed: #E0569B;

  }

  code {
   //font-family:  "Fira code";
  }  
</style>

# About coroutines in Ballerina 🩰
by Dr Giuseppe Maggiore

---
# The challenge
- We run promises all the time
- Promises might take a long time or fail
- The user interacts with the application

All of this happens potentially *at the same time*.
The order of operations is *unpredictable*.
The duration of the single operations varies hugely between development and production, or even from user to user.

---
# Issues
- Heisenbugs that cannot be replicated in production
- Values that "jump back" because of implicit write-on-write conflicts
- Loaders/spinners that get stuck forever

In general, concurrency is very hard. And the bad news: if we don't manage it correctly, it gets...even harder!!!

---
# Ok, what about good news?!?
Yes, there are good news: we can manage this.
Introducing...**coroutines**.

---
# Corouwhat?
- Coroutines are "cooperative/concurrent routines"
- Pieces of code that, in their most basic format, can either
  - Read the state
  - Write to the state
  - Give back a result
  - Suspend for some time

---
# Very simple example

We start by defining a coroutine builder, which specifies the Readonly context (what the coroutines can read, but not modify) and the writable state (what the coroutine may both read and write):

```ts
type Context = { stepSize:number }
type State = { value:number }
const Co = CoTypedFactory<Context, State>
```

---
Now we perform a few steps in an animation loop:

```ts
Co.GetState().then(context => 
Co.Repeat(
  Co.Seq([
    Co.SetState(replaceWith({ value:0 }),
    Co.Wait(50)
    Co.For(Range(0, 10), i =>
      Co.SetState(incrementValue(context.stepSize)),
      Co.Wait(50)
    )
  ])
))
```

Very straightforward, right?

---
# A bit more interesting scenarios
- We can do much more with coroutines
- Coroutines can be composed together
- The most important operators are
  - Co.All, which runs all given coroutines in parallel to completion
  - Co.Any, which runs all given coroutines in parallel until the first terminates

---
# Let's see this in action!
Mouse selection
- waits for the `onmousedown` event
- then forever at every `onmousemove` refreshes the selection under the mouse
- while in parallel (`Co.Any`) waiting for the `onmouseup`

---
```ts
Co.On("mousedown").then((e) =>
Co.SetState(CameraState.Updaters.StartDragToMove(...e...))).then(() =>
  Co.Any([
    Co.Repeat(
      Co.On("mousemove").then((e) =>
        Co.SetState(CameraState.Updaters.MouseMove(...e...)
      )
    )
  ),
  Co.Any([
    Co.On("mouseup").then(() =>
      Co.SetState(CameraState.Updaters.EndDragToMove)),
    Co.On("mouseleave").then((_) =>
      Co.SetState(CameraState.Updaters.EndDragToMove)
    ),
  ]),
]));

```

---
# Even juicier
In a websocket application, two instances of the application communicate directly.
The keepalive coroutine waits for the "alive" message, and in parallel (`Co.Any`) waits for the timeout to mark the other party as disconnected.

---
```ts
Co.Repeat(
  Co.Any([
    Co.On("ping-from-remote"),
    Co.Seq([
      Co.Any([Co.On("remote-left"), Co.Wait(1000 * 60 * 10)]),
      Co.GetState().then((state) =>
        Co.SetState(
          LocalBroadcastingState.Updaters.RemoteConnected(
            replaceWith(ConnectionStatus.Default.Inert())
          )
        )
      )
    ])
  ])
)
```

---
# API calls with retry
An API call might fail because of a transient error. In this case, we should not jump to an error immediately, but rather wait a bit and retry (with a reasonable maximum).

Coroutines make this totally trivial!

---
# Coroutine embedding
Coroutines can be modular and reusable.

Suppose we have a coroutine `k` that operates on a smaller state `c` (stands for _child_), but the real state is a bigger `p` (stands for _parent_) containing not only `c`, but also many more things.

We can _embed_ `k` so that it operates on `p`. We just need:
- a narrowing operator `p => c`
- a widening operator `Updater<c> => Updater<p>`

---
Embed the loader of thumbnails and pages into the broader document state:

```ts
thumbnailsAndPagesLoaderCoroutine()
  .embed(_ => ({ ...ImagesLoaderContext.Operations.FromDocumentViewerState(_), events: [] }),
    (events) => ImagesLoaderEvent.Operations.ToDocumentViewerState(Updater(events))
  ),
```


---
# Conclusion
Ballerina 🩰 coroutines offer a powerful set of advanced concurrency-management operators.
They allow us to define timed choreographies that are easy to write and intuitive to read.
Embedding makes it possible to define smaller choerographies that we can reuse in many more contexts.

---
# Conclusion/2
Ballerina 🩰 coroutines are completely framework independent.
They work in React, Vue, Angular, jQuery, node.js.
[github.com/giuseppemag/ballerina](github.com/giuseppemag/ballerina)

---
Conclusion/3
Harness the power of time, with Ballerina 🩰 coroutines.

![bg right](./pics/smiling-dude.png)
