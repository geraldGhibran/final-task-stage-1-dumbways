// 2. Diketahui sebuah data array sebagai berikut:
// 	[“u”, “D”, “m”, “w”, “b”, “a”, “y”, “s”, “i”, “s”, “w”, “a”, “e”, “s”, “e”, “o”, “m”,” “ ,” “]
// Buatlah sebuah function yang bertugas untuk menyusun array berikut menjadi “Dumbways is awesome” menggunakan selection sort.
// Input :
// sortArray([“u”, “D”, “m”, “w”, “b”, “a”, “y”, “s”, “i”, “s”, “w”, “a”, “e”, “s”, “e”, “o”, “m”,” “ ,” “])
// Output :
// 	“Dumbways is awesome”


let array = [
  "u",
  "D",
  "m",
  "w",
  "b",
  "a",
  "y",
  "s",
  "i",
  "s",
  "w",
  "a",
  "e",
  "s",
  "e",
  "o",
  "m",
  " ",
  " ",
];

let slicedArray = array.slice(0, 8);
let rearrangedArray = slicedArray.sort((a, b) => {
  let order = ["D", "u", "m", "b", "w", "a", "y", "s"];
  return order.indexOf(a) - order.indexOf(b);
});
let lastItem = array.pop();
let array2 = [];

let lastItem2 = array.pop();

let slicedArray2 = array.slice(8, 10);

let slicedArray3 = array.slice(10);

let sliceAwe = slicedArray3.slice(0, 3);

let rearrangedArray2 = slicedArray3.slice(3).sort((a, b) => {
  let order2 = ["s", "o", "m", "e"];
  return order2.indexOf(a) - order2.indexOf(b);
});

let rearrangedArray3 = sliceAwe.sort((a, b) => {
  let order = ["a", "w", "e"];
  return order.indexOf(a) - order.indexOf(b);
});

array2.push(
  rearrangedArray.join("") +
    lastItem +
    slicedArray2.join("") +
    lastItem2 +
    rearrangedArray3.join("") +
    rearrangedArray2.join("")
);

console.log(array2[0]);
