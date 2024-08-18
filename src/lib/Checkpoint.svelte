<script lang="ts">
  import { onMount } from "svelte";
  import { getCheckpoint, type Checkpoint } from "$lib/log";

  export let finalIndex: number | undefined;
  export function refresh() {
    getCheckpoint().then((cp) => {
      checkpoint = cp;
    });
  }

  let checkpoint: Checkpoint | undefined = undefined;

  $: if (checkpoint) {
    finalIndex = checkpoint.entries - 1;
  }

  onMount(async () => {
    checkpoint = await getCheckpoint();
  });
</script>

{#if checkpoint}
  <div class="border border-black">
    <pre class="p-2">{checkpoint.text}</pre>
  </div>
{:else}
  <p>Loading...</p>
{/if}
