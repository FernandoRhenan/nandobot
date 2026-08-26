export default class Algorithms {
  static shuffleNumbers(array: number[]) {
    const result = [];
    for (let i = array.length - 1; i >= 0; i--) {
      const r = Math.floor(Math.random() * (i + 1));

      for (let j = 0, k = 0; j <= array.length - 1; j++) {
        if (result[j] === undefined) {
          if (k === r) {
            result[j] = array[i];
            break;
          }
          k++;
        }
      }
    }
    return result;
  }
}
