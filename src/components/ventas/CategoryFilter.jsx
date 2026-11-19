import React from 'react';

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="flex space-x-3 overflow-x-auto pb-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer capitalize ${
            selectedCategory.toLowerCase() === cat.toLowerCase()
              ? "bg-[#5C4033] text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          {cat === "Temporada" ? " Temporada" : cat}
        </button>
      ))}
    </div>
  );
}