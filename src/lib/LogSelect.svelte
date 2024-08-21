<script lang="ts">
  import { onMount, setContext } from "svelte";
  import Route from "./Route.svelte";

  let showSelector: boolean | undefined = undefined;
  let logUrl: string;

  let dropdownObj: HTMLSelectElement;
  let dropdownVal: string;
  $: setLogUrl(dropdownVal);

  function setLogUrl(l: string) {
    setContext("log_url", l);
    logUrl = l;

    if (!dropdownObj) return;
    const url = new URL(window.location.href);
    url.searchParams.set(
      "log",
      dropdownObj.options[dropdownObj.selectedIndex].dataset.logid ?? "unknown"
    );
    window.history.pushState({}, "", url);
  }

  if (import.meta.env.VITE_LOG_URL) {
    setContext("log_url", import.meta.env.VITE_LOG_URL);
    logUrl = import.meta.env.VITE_LOG_URL;
    showSelector = false;
  } else {
    showSelector = true;
  }

  onMount(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const logId = searchParams.get("log");
    console.log(logId);
    if (logId) {
      const options = Array.from(dropdownObj.options).find(
        (option) => option.dataset.logid === logId
      );
      if (options) {
        options.selected = true;
        dropdownVal = options.value;
      }
    }
  });
</script>

<div class="flex flex-col items-center justify-start pt-10">
  {#if showSelector}
    <label hidden for="logselect">Log Selector Dropdown</label>
    <select
      class="border border-black p-1 bg-transparent"
      bind:value={dropdownVal}
      bind:this={dropdownObj}
      name="logselect"
    >
      <option
        selected
        data-logid="1"
        value="https://api.transparency.dev/armored-witness-firmware/prod/log/1/"
        >Armored Witness Firmware Prod</option
      >
      <option
        data-logid="2"
        value="https://api.transparency.dev/armored-witness-firmware/ci/log/4/"
        >Armored Witness Firmware Dev</option
      >
      <option
        data-logid="3"
        value="https://raw.githubusercontent.com/f-secure-foundry/armory-drive-log/master/log/"
        >Armory Drive Log</option
      >
    </select>
  {/if}

  {#if logUrl !== undefined}
    {#key logUrl}
      <Route />
    {/key}
  {/if}
</div>
