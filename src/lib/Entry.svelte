<script lang="ts">
  import { getLeaf } from "$lib/log";

  export let index = 0;
  let text: string;

  async function refreshLeaf(i: number) {
    text = await getLeaf(i);
  }

  $: refreshLeaf(index);
</script>

<div>
  <p>{index}</p>
  <br />
  <pre>{text}</pre>
</div>
