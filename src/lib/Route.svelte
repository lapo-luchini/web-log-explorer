<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import Checkpoint from "$lib/Checkpoint.svelte";
  import Entry from "$lib/Entry.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { ArrowLeft, ArrowRight, RotateCw } from "lucide-svelte";

  // Index is the index rendered by the Entry component
  let index: number | undefined;
  // Hash reflects the current value of the URL hash
  let hash: number | undefined;
  // Final Index is set by the Checkpoint component
  let finalIndex: number | undefined;

  // Update the index preferring the value of the hash, but clamping to the final index
  $: index =
    hash !== undefined && finalIndex !== undefined && hash < finalIndex
      ? hash
      : finalIndex;

  // Update the hash if the index is not the final one or if the hash already exists
  $: if (index !== undefined && (hash !== undefined || index !== finalIndex)) {
    window.location.hash = index.toString();
  }

  // Listen for hash changes
  function handleHashChange() {
    const parse = Number.parseInt(window.location.hash.slice(1), 10);
    if (parse !== hash) {
      hash = isNaN(parse) ? undefined : parse;
    }
  }

  onMount(() => {
    handleHashChange(); // Initial call
    window.addEventListener("hashchange", handleHashChange);
  });

  onDestroy(() => {
    window.removeEventListener("hashchange", handleHashChange);
  });

  // Functions to handle forward and backward buttons
  function goForward() {
    if (index !== undefined && finalIndex !== undefined && index < finalIndex) {
      index += 1;
    }
  }

  function goBack() {
    if (index !== undefined && finalIndex !== undefined && index > 0) {
      index -= 1;
    }
  }

  // Reference to the Checkpoint component
  let checkpointRef: Checkpoint;
  function refresh() {
    // If the user explicitly refreshes the page, remove the hash
    window.history.replaceState(undefined, "", window.location.pathname);
    checkpointRef.refresh();
  }
</script>

<div class="flex flex-col items-center justify-start gap-4 min-h-screen pt-10 pb-20">
  <!-- Bind mostRecent to allow updates to flow up from the child component -->
  <Checkpoint bind:finalIndex bind:this={checkpointRef} />

  {#if index !== undefined}
    <div class="flex items-center justify-center gap-6">
      <Button
        on:click={goBack}
        class={!index ? "invisible pointer-events-none" : ""}
        ><ArrowLeft /></Button
      >

      <div class="w-20 text-center">{index}</div>

      {#if index !== finalIndex}
        <Button on:click={goForward}><ArrowRight /></Button>
      {:else}
        <Button on:click={() => refresh()}><RotateCw /></Button>
      {/if}
    </div>

    <Entry {index} />
  {/if}
</div>
