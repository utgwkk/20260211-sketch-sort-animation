import { useSyncExternalStore } from "react";
import "./App.css";
import { arrayToShuffled } from "array-shuffle";

const DEFAULT_N = 200;
const N = (() => {
  const n = Number(new URLSearchParams(location.search).get("n") ?? DEFAULT_N);
  return !Number.isNaN(n) && n > 0 ? n : DEFAULT_N;
})();
let arr = arrayToShuffled(new Array(N).fill(0).map((_, i) => i));

function* swap(i: number, j: number) {
  [arr[i], arr[j]] = [arr[j], arr[i]];
  arr = arr.slice(); // for useSyncExternalStore
  yield;
}

function* bubbleSort() {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (arr[j] < arr[j + 1]) {
        yield* swap(j, j + 1);
      }
    }
  }
}

function* shakerSort() {
  let top = 0,
    bottom = arr.length - 1;
  for (;;) {
    let lastSwapIdx = top;
    for (let i = top; i < bottom; i++) {
      if (arr[i] < arr[i + 1]) {
        yield* swap(i, i + 1);
        lastSwapIdx = i;
      }
    }
    bottom = lastSwapIdx;
    if (top === bottom) {
      break;
    }
    lastSwapIdx = bottom;
    for (let i = bottom; i > top; i--) {
      if (arr[i] > arr[i - 1]) {
        yield* swap(i, i - 1);
        lastSwapIdx = i;
      }
    }
    top = lastSwapIdx;
    if (top === bottom) {
      break;
    }
  }
}

function* insertionSort() {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] < arr[i]) {
      let j = i;
      const tmp = arr[i];
      do {
        yield* swap(j, j - 1);
        j--;
      } while (j > 0 && arr[j - 1] < tmp);
      arr[j] = tmp;
    }
  }
}

function* mergeSort(left: number, right: number): Generator {
  const middle = (left + right) >> 1;
  if (left === right || left === right - 1) {
    return;
  }
  yield* mergeSort(left, middle);
  yield* mergeSort(middle, right);

  // merge
  const newArrPart: number[] = [];
  let leftIdx = left,
    rightIdx = middle;
  while (leftIdx < middle && rightIdx < right) {
    if (arr[leftIdx] > arr[rightIdx]) {
      newArrPart.push(arr[leftIdx]);
      leftIdx++;
    } else {
      newArrPart.push(arr[rightIdx]);
      rightIdx++;
    }
  }
  if (left === middle) {
    while (rightIdx < right) {
      newArrPart.push(arr[rightIdx]);
      rightIdx++;
    }
  } else {
    while (leftIdx < middle) {
      newArrPart.push(arr[leftIdx]);
      leftIdx++;
    }
  }
  for (let i = 0; i < newArrPart.length; i++) {
    const swapIdx = arr.findIndex((x) => x === newArrPart[i]);
    yield* swap(left + i, swapIdx);
  }
}

const subscribe = (onChange: () => void) => {
  const gen = (() => {
    switch (new URLSearchParams(location.search).get("algorithm")) {
      case "bubble":
        return bubbleSort();
      case "shaker":
        return shakerSort();
      case "insertion":
        return insertionSort();
      case "merge":
        return mergeSort(0, arr.length);
      default:
        return bubbleSort();
    }
  })();
  let swapCount = 0;
  const timer = window.setInterval(() => {
    swapCount++;
    const { done } = gen.next();
    onChange();
    if (done) {
      console.log(`finished with ${swapCount} swaps`);
      window.clearInterval(timer);
    }
  }, 1000 / 120);
  return () => window.clearInterval(timer);
};

const getSnapshot = () => arr;

function Bar({ value }: { value: number }) {
  return (
    <div
      key={value}
      style={{
        width: `${100 / arr.length}%`,
        height: `${(100 * (value + 1)) / arr.length}%`,
        backgroundColor: "black",
      }}
    ></div>
  );
}

function App() {
  const values = useSyncExternalStore(subscribe, getSnapshot);
  return (
    <div className="container">
      {values.map((v) => (
        <Bar key={v} value={v} />
      ))}
    </div>
  );
}

export default App;
