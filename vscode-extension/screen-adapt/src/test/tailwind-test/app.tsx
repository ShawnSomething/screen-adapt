import React from 'react';
/* screen-adapt: skipped elements (already have variants)
   <div className="w-96 p-8 m-4 text-xl grid grid-cols-3 flex-row sm:w-44 sm:p-3.5 sm:m-2 sm:text-s...">
*/

export default function App() {
  return (
    <>
        <div className="w-96 p-8 m-4 text-xl grid grid-cols-3 flex-row sm:w-44 sm:p-3.5 sm:m-2 sm:text-sm sm:grid sm:grid-cols-1 sm:flex-col md:w-52 md:p-4 md:m-2 md:text-base md:grid md:grid-cols-2 md:flex-row lg:w-72 lg:p-6 lg:m-3 lg:text-lg lg:grid lg:grid-cols-3 lg:flex-row">
        <h1 className="text-3xl p-4 sm:text-lg sm:p-2 md:text-xl md:p-2 lg:text-2xl lg:p-3">Hello</h1>
        <p className="text-base px-6 py-4 max-w-96 sm:text-xs sm:px-2.5 sm:py-2 sm:max-w-44 md:text-xs md:px-3 md:py-2 md:max-w-52 lg:text-sm lg:px-4 lg:py-3 lg:max-w-72">Some text here</p>
        <div className="w-48 h-48 p-2 m-2 text-lg grid-cols-2 sm:w-20 sm:h-20 sm:p-1 sm:m-1 sm:text-xs sm:grid-cols-1 md:w-24 md:h-24 md:p-1 md:m-1 md:text-sm md:grid-cols-2 lg:w-36 lg:h-36 lg:p-1.5 lg:m-1.5 lg:text-base lg:grid-cols-2">
            <span className="text-sm p-1 sm:text-xs sm:p-0.5 md:text-xs md:p-0.5 lg:text-xs lg:p-0.5">Item</span>
5        </div>
        </div>
    </>
  )
  // screen-adapt: review these classes
  // sm:grid, md:grid, lg:grid
}