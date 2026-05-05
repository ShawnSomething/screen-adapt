import React from 'react';

export default function App() {
  return (
    <>
        <div className="w-96 p-8 m-4 text-xl grid grid-cols-3 flex-row">
        <h1 className="text-3xl p-4">Hello</h1>
        <p className="text-base px-6 py-4 max-w-96">Some text here</p>
        <div className="w-48 h-48 p-2 m-2 text-lg grid-cols-2">
            <span className="text-sm p-1">Item</span>
        </div>
        </div>
    </>
  )
}