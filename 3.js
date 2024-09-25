// 3. Buatlah sebuah function yang akan 
// mencetak pola segitiga terbalik yang terdiri 
// atas karakter # dan + seperti berikut:
//             cetakPola(5)
// #  +  #  +  #
//  +  +  +  +  
//   +  #  +
//    +  +
//      #


function reverseTriangle(n) {
let triangle = '';
let space = ' ';
    for (let i = 0; i < n; i++) {
        let row = ''.repeat(i);
        for (let j = 0; j < n - i; j++) {
          row += (j % 2 === 0 && i % 2 ===0 ? '#' : i % 2 !==0 ? '+' : '+' )+ ' ';
          
        }
        triangle += row.trim() + '\n' + space.repeat((n + i -4));
    }
    return triangle;
}

console.log(reverseTriangle(5));