<script>import "./app.css";
import Counter from "./lib/Counter.svelte";</script>

<main>
  <h1>Vite + Svelte</h1>

  <div class="card">
    <Counter></Counter>
  </div>

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">
    {import.meta.env.VITE_LOG_URL}
  </p>
</main>
