'use client';

import { X, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: { allergens: string[]; diet: string[]; goals: string[] };
  setPreferences: (prefs: any) => void;
}

const ALLERGENS = [
  'Gluten', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Peanuts', 'Tree Nuts',
  'Fish', 'Shellfish', 'Sesame', 'Milk',
];

const DIETS = [
  'Vegan', 'Vegetarian', 'Halal', 'Kosher', 'Keto', 'Gluten-Free',
  'Sugar-Conscious', 'Low-Sodium', 'Paleo',
];

export default function ProfileModal({ isOpen, onClose, preferences, setPreferences }: ProfileModalProps) {
  if (!isOpen) return null;

  const toggle = (category: 'allergens' | 'diet', item: string) => {
    const current: string[] = preferences[category] || [];
    const updated = current.includes(item)
      ? current.filter((i: string) => i !== item)
      : [...current, item];
    setPreferences({ ...preferences, [category]: updated });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden max-h-[85vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Dietary Profile</h2>
            <p className="text-sm text-gray-500 mt-0.5">Personalize your safety verdicts</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Allergens */}
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Allergies</h3>
            <p className="text-sm text-gray-500 mb-3">Products with these will be flagged <span className="text-red-600 font-semibold">Avoid</span></p>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map(item => {
                const selected = (preferences.allergens || []).includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggle('allergens', item)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${selected
                        ? 'bg-red-500 text-white border-red-500 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
                      }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary prefs */}
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Dietary Preferences</h3>
            <p className="text-sm text-gray-500 mb-3">Personalize your product analysis.</p>
            <div className="flex flex-wrap gap-2">
              {DIETS.map(item => {
                const selected = (preferences.diet || []).includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggle('diet', item)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${selected
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {((preferences.allergens || []).length > 0 || (preferences.diet || []).length > 0) && (
            <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 space-y-1">
              {(preferences.allergens || []).length > 0 && (
                <p>🚫 Avoiding: <span className="font-medium text-gray-900">{preferences.allergens.join(', ')}</span></p>
              )}
              {(preferences.diet || []).length > 0 && (
                <p>🥗 Diet: <span className="font-medium text-gray-900">{preferences.diet.join(', ')}</span></p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
