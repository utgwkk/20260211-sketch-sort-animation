import { useSyncExternalStore } from "react";
import "./App.css";
import { arrayToShuffled } from "array-shuffle";

let arr = (() => arrayToShuffled(new Array(160).fill(0).map((_, i) => i)))();

function* bubbleSort() {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (arr[j] < arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        arr = arr.slice();
        yield;
      }
    }
  }
}

function* insertionSort() {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] < arr[i]) {
      let j = i;
      const tmp = arr[i];
      do {
        [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
        arr = arr.slice();
        yield;
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
    arr[left + i] = newArrPart[i];
    arr = arr.slice();
    yield;
  }
}

const subscribe = (onChange: () => void) => {
  const gen = (() => {
    switch (new URLSearchParams(location.search).get("algorithm")) {
      case "bubble":
        return bubbleSort();
      case "insertion":
        return insertionSort();
      case "merge":
        return mergeSort(0, arr.length);
      default:
        return bubbleSort();
    }
  })();
  const timer = window.setInterval(() => {
    const { done } = gen.next();
    onChange();
    if (done) {
      window.clearInterval(timer);
    }
  }, 1000 / 120);
  return () => window.clearInterval(timer);
};

const getSnapshot = () => arr;

function App() {
  const values = useSyncExternalStore(subscribe, getSnapshot);
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {values.map((v) => (
        <div
          key={v}
          style={{
            width: `${100 / arr.length}%`,
            height: `${(100 * (v + 1)) / arr.length}%`,
            backgroundColor: "black",
            // backgroundColor: `hsl(${(720 * (v + 1)) / arr.length} 100% 50%)`,
          }}
        ></div>
      ))}
    </div>
  );
}

export default App;
