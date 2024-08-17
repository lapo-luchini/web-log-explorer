<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import Checkpoint from "./Checkpoint.svelte";
  import Entry from "./Entry.svelte";

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

<!-- Bind mostRecent to allow updates to flow up from the child component -->
<!-- Remounter forces the component to refresh -->
<Checkpoint bind:finalIndex bind:this={checkpointRef} />

<br />

{#if index === finalIndex}
  <button on:click={() => refresh()}>Refresh</button>
{:else}
  <div />
{/if}

<br />

{#if index}
  <button on:click={goBack}>Back</button>
{:else}
  <div />
{/if}

<br />

{#if index !== finalIndex}
  <button on:click={goForward}>Forward</button>
{:else}
  <div />
{/if}

<br />

{#if index !== undefined}
  <Entry {index} />
{/if}
