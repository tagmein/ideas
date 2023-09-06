export function space_fill_2d_to_1d(x: number, y: number) {
 const square_size = Math.max(x + 1, y + 1)
 const last_square_size = square_size - 1
 const last_square_area = last_square_size * last_square_size
 return (
  last_square_area + (x === square_size - 1 ? y : 2 * last_square_size - x)
 )
}
