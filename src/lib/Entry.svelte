<script lang="ts">
  import { getLeaf } from "$lib/log";
  import { getContext } from "svelte";

  const logUrl: string = getContext("log_url");

  export let index = 0;
  let text: string;

  async function refreshLeaf(i: number) {
    text = await getLeaf(logUrl, i);
  }

  $: refreshLeaf(index);
</script>

{#if text !== undefined}
  <div class="border border-black max-w-full">
    <pre class="p-2 whitespace-pre-wrap overflow-auto">{text}</pre>
  </div>
{:else}
  <p>Loading...</p>
{/if}
