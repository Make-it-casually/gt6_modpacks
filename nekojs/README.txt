=== NekoJS Script Directory Guide ===
- startup_scripts: Loaded during game startup. Used for registering items and blocks. Changes require a full game restart.
- server_scripts: Executed when the world/server loads. Used for recipes and event handling. Can be reloaded with /reload.
- client_scripts: Runs on the client only. Used for GUI, key bindings, etc.
- test_scripts: Explicit smoke/regression scripts. Run with /nekojs test; they are not loaded by normal startup or reload.
- Note: Automatically generated type declaration files (.d.ts) are located in the .neko_probe folder. Do not modify them manually.
- Tip: Write .ts (or add // @ts-check at the top of a .js file) to enable editor type-checking; run /nekojs view_all_errors in-game to inspect script errors.