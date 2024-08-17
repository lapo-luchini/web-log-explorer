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
  <div>
    <h2>Checkpoint</h2>
    <p>{checkpoint.origin}</p>
    <p>{checkpoint.entries}</p>
  </div>
{:else}
  <p>Loading...</p>
{/if}
