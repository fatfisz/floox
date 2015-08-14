# Migration guide for flux-store-base

These are some pointers that will help you with a smooth transition to [floox](https://github.com/fatfisz/floox) if you've been using [flux-store-base](https://github.com/fatfisz/flux-store-base).
Most of those are a simple copy-paste work.

## Flux

Remove Flux and the dispatcher - they are built into floox already.

## Store base

If you've followed [this tip](https://github.com/fatfisz/flux-store-base#pro-tip-inject-the-dispatcher), then you can remove the file.
All stores are created using [`floox.createStore`](https://github.com/fatfisz/floox#flooxcreatestorestorename-config), which takes care of initiating the dispatcher.

## Preloading stores and actions

Before you'd be requiring stores and actions in the components, but now it's for the best if you don't do it that way because there are other built-in ways for accessing them.

See: [including the stores and custom actions](https://github.com/fatfisz/floox#including-the-stores-and-custom-actions).
Basically, require all files containing stores and actions somewhere in the entry point of your application.
Using glob patterns for that helps a lot because instead of requiring each file you can require the whole directory.

## Stores

Remove all `require` with your stores and replace them with `var floox = require('floox');`.
Then you can use `floox.stores.<store name>` to reference a store.

There are some changes to the config as well:

### Display name

`displayName` becomes the first argument to `floox.createStore` and is now obligatory.

### Events

If you declared that only the `change` event would be handled, like this:

```js
{
  events: ['change'],
  ...
}
```

then you can remove the `events` property altogether.
The `change` event is declared by default if [`events`](https://github.com/fatfisz/floox#configevents) is not present in the config.

If you have declared more events or didn't include the `change` event in the list, leave the `events` property as it is.

Also replace any calls to `emitTheChange`, `addTheChangeListener`, and `removeTheChangeListener` (for the event `theChange`) with `emit('theChange')`, `on('theChange', ...)` and `off('theChange', ...)`.

### Action handlers

Add the [`handlers`](https://github.com/fatfisz/floox#confighandlers) property to the config and move all your action handlers there.
Remove the `on` part, it's not necessary anymore.

So this:

```js
{
  onStorageAddItem(item) {
    // add an item
  },
  ...
}
```

should become this:

```js
{
  handlers: {

    storageAddItem(item) {
      // add an item
    },

    ...
  },
  ...
}
```

Remember that you can now use [namespaces](https://github.com/fatfisz/floox#namespaces), so for example if you had methods `onStorageAddItem` and `onStorageItemsLoaded`, they could become `storage.addItem` and `storage.itemsLoaded`, which can be declared like this:

```js
{
  handlers: {
    storage: {

      addItem(item) {
        // add an item
      },

      itemsLoaded() {
        // do something after items are loaded
      },

    },
  },
  ...
}
```

### Using waitFor

You don't have to [include the dispatcher](https://github.com/fatfisz/flux-store-base#dispatch-token) anymore, because a new [`waitFor`](https://github.com/fatfisz/floox#flooxstoresstore-namewaitforstorenames) method is available to the store, which is less cumbersome to use, because it eliminates the need to require another store to get its dispatch token.

Replace this:

```js
AppDispatcher.waitFor([VeryFineStore.dispatchToken]);
```

with

```js
this.waitFor(['VeryFineStore']);
```

This assumes the method is called from within the action handler (`this` must be the store) and there is a store with a name `VeryFineStore`.

### Referencing other stores from a store

This can be done by using the central store repository, `floox.stores`.
That way there should be no problems with circular dependencies (before you'd have to require one store in another).

## Actions

Remove all `require` with your actions and replace them with `var floox = require('floox');`.
Then you can use `floox.actions.<action name>()` to dispatch an action.

### No more `dispatchSomeAction`

This was ugly and littered the Flux dispatcher object.
Just call `floox.actions.someAction`.

### Plain action dispatchers

You can remove every action dispatcher that looked like this:

```js
function createSomeAction(someData) {
  AppDispatcher.dispatchSomeAction(someData);
}
```

These functions that only pass the argument and do nothing more are now automatically added when creating stores.

### Creating action creators

Use [`floox.createAction`](https://github.com/fatfisz/floox#flooxcreateactionactionname-action) to create a more complicated action creator, accessible through `floox.actions.<action name>`.

Remember that you can overwrite the automatically created action dispatcher and still be able to reference it from inside the action creator - action dispatchers are passed as a first argument to the creator.

## Mixin

Floox comes with a cool new feature, which is a [mixin](https://github.com/fatfisz/floox#flooxstatefromstoremixin) that updates the component state when a store emits the `change` event.

By using it you can get rid of calling `store.on` and `store.off` in component lifecycle methods almost completely.
