import { writable } from "svelte/store";



export const renderWatcher = writable<{doneDrawing?: boolean, maxScrollIndex?: number, scrollIndex?: number}>({});
