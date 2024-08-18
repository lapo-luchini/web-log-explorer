<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import Checkpoint from "$lib/Checkpoint.svelte";
  import Entry from "$lib/Entry.svelte";
  import RotateCw from "$lib/icons/RotateCw.svelte";
  import ArrowLeft from "$lib/icons/ArrowLeft.svelte";
  import ArrowRight from "$lib/icons/ArrowRight.svelte";

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

  const buttonStyle = "w-12 h-12 p-3";
</script>

<div
  class="flex flex-col items-center justify-start gap-6 min-h-screen pt-10 pb-20"
>
  <!-- Bind mostRecent to allow updates to flow up from the child component -->
  <Checkpoint bind:finalIndex bind:this={checkpointRef} />

  {#if index !== undefined}
    <div class="flex items-center justify-center gap-6">
      <button
        on:click={goBack}
        class={buttonStyle + (!index ? "invisible pointer-events-none " : "")}
      >
        <ArrowLeft />
      </button>

      <div class="w-32 text-center">Leaf {index}</div>

      {#if index !== finalIndex}
        <button class={buttonStyle} on:click={goForward}><ArrowRight /></button>
      {:else}
        <button class={buttonStyle} on:click={() => refresh()}>
          <RotateCw />
        </button>
      {/if}
    </div>

    <Entry {index} />
  {/if}
</div>
