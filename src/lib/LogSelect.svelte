<script lang="ts">
  import { setContext } from "svelte";
  import Route from "./Route.svelte";

  let showSelector: boolean | undefined = undefined;
  let logUrl: string;

  let dropdownVal: string;
  $: setLogUrl(dropdownVal);

  function setLogUrl(url: string) {
    setContext("log_url", url);
    logUrl = url;
  }

  if (import.meta.env.VITE_LOG_URL) {
    dropdownVal = import.meta.env.VITE_LOG_URL;
    showSelector = false;
  } else {
    showSelector = true;
  }
</script>

<div class="flex flex-col items-center justify-start pt-10">
  {#if showSelector}
    <label hidden for="logselect">Log Selector Dropdown</label>
    <select class="border border-black p-1 bg-transparent" bind:value={dropdownVal} name="logselect">
      <option
        selected
        value="https://api.transparency.dev/armored-witness-firmware/prod/log/1/"
        >Armored Witness Firmware Prod</option
      >
      <option
        value="https://api.transparency.dev/armored-witness-firmware/ci/log/4/"
        >Armored Witness Firmware Dev</option
      >
      <option
        value="https://raw.githubusercontent.com/f-secure-foundry/armory-drive-log/master/log/"
        >Armory Drive Log</option
      >
    </select>
  {/if}

  {#if showSelector !== undefined}
    {#key logUrl}
      <Route />
    {/key}
  {/if}
</div>
