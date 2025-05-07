## How to create a case

Create a class that extends the `BaseCase.ts`. See `DukeCase.ts` as example.

## BaseCase.ts

This class contains common fields and methods that will be used in multiple cases. When you need to add something to handle a single case, think about if it may be needed somewhere else. If so, create a generic method for it.

## How to

#### Send an event to everyone in a namespace (room/match)

```typescript
namespace.emit(/* ... */);
```

#### Send an event to everyone except the sender

```typescript
socket.broadcast.emit("EVENT_NAME", { /* data */})
```

#### Send an event to a specific player

```typescript
namespace.to(targetSocket.id).emit("EVENT_NAME", { /* data */})
```

#### Send an event and wait for a response

```typescript
// Use withTimeout from emitUtil.ts
socket.emit("hello", 1, 2, withTimeout(() => {
  console.log("success!");
}, () => {
  console.log("timeout!");
}, 1000));
```
