<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { getCheckpoint, type Checkpoint } from "$lib/log";

  const logUrl: string = getContext("log_url");

  export let finalIndex: number | undefined;
  export function refresh() {
    getCheckpoint(logUrl).then((cp) => {
      checkpoint = cp;
    });
  }

  let checkpoint: Checkpoint | undefined = undefined;

  $: if (checkpoint) {
    finalIndex = checkpoint.entries - 1;
  }

  onMount(async () => {
    checkpoint = await getCheckpoint(logUrl);
  });
</script>

{#if checkpoint}
  <div class="border border-black">
    <pre class="p-2">{checkpoint.text}</pre>
  </div>
{:else}
  <p>Loading...</p>
{/if}
