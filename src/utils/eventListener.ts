import { type KeyboardEvent } from "react";

export function onKeyDownNavLink(event: KeyboardEvent, callback: () => void) {
  if (event.key === "Enter" || event.code === "Space") {
    event.preventDefault();
    callback();
  }
}
