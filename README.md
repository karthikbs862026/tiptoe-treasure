# Tiptoe Treasure

A cute mobile-friendly stealth puzzle game for Android, iOS, and desktop browsers.

## Game Fantasy

You play as a child searching a cozy house for a hidden board game. The board game is secretly placed in a random searchable object each run. The player wins by checking house objects, using warmer or colder feedback, hiding when needed, and staying calm around grown-up patrols.

## Controls

- Keyboard: WASD or arrow keys to move, Space or Enter to search.
- Touch: use the direction pad and the Search button.
- Blue spots hide the child from sight cones.

## Design Notes

- Short-session stealth puzzle built for portrait or landscape phone screens.
- Calm meter replaces harsh failure: being seen drains calm, hiding restores it.
- Each run randomly chooses the board game's hiding place.
- Wrong searches mark that object off and give a warmer or colder hint.
- Searching makes noise. Nearby grown-ups turn toward the sound and briefly investigate.
- The search loop rewards routing, memory, and timing instead of reading clue chains.
- The HUD stays on screen edges so the playfield remains readable.

## Run

Open `index.html` in a browser. No build step or package install is required.

## Share Online

This is a static web app. Upload the whole folder to any static host such as GitHub Pages, Netlify, Vercel, Cloudflare Pages, or itch.io HTML games. Once hosted over HTTPS, the Share button opens the phone share sheet and the game can be added to the Android or iOS home screen.

For local `file://` use, the game still plays, but install/offline/share features only fully work from an HTTPS link.
