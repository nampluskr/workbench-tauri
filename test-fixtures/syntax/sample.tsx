// TSX sample.
import { createSignal, For, type JSX } from "solid-js";

type Props = {
  title: string;
  items: readonly string[];
  onPick?: (item: string) => void;
};

export function List(props: Props): JSX.Element {
  const [picked, setPicked] = createSignal<string | null>(null);
  const pick = (item: string) => {
    setPicked(item);
    props.onPick?.(item);
  };
  return (
    <section class="list" data-count={props.items.length}>
      <h2>{props.title}</h2>
      {/* a JSX comment */}
      <ul>
        <For each={props.items}>
          {(item) => (
            <li classList={{ active: picked() === item }} onClick={() => pick(item)}>
              {item}&nbsp;
            </li>
          )}
        </For>
      </ul>
      <p>Picked: {picked() ?? "none"}, total {props.items.length * 1}</p>
    </section>
  );
}
