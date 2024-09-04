<script lang="ts">
  import { buf2hex, getIndex, LogEntry } from "$lib/ctlog";
  import { getContext } from "svelte";

  const logUrl: string = getContext("log_url");

  export let index = 0;
  let entry: LogEntry;

  async function refreshLeaf(i: number) {
    entry = await getIndex(logUrl, i);
  }

  $: refreshLeaf(index);
</script>

{#if entry !== undefined}
  <div class="border border-black max-w-full">
    <pre class="p-2 whitespace-pre-wrap overflow-auto">
Leaf Index: {entry.LeafIndex}
Timestamp: {entry.Timestamp}
Fingerprint: {buf2hex(entry.CertificateFp)}
Entry Type: {entry.IsPrecert ? "Precert" : "X.509 Certificate"}

Submission in local time: {new Date(entry.Timestamp).toLocaleString()}

<a href="https://crt.sh/?q={buf2hex(entry.CertificateFp)}"
        >Click to view full details on crt.sh (this will not work for brand new certs)</a
      ></pre>
  </div>
{:else}
  <p>Loading...</p>
{/if}
