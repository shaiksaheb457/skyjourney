// components/booking/AddOnsSelector.jsx — Meal, seat & extra baggage selector
import { useState } from 'react'
import { Utensils, Armchair, Luggage, Check } from 'lucide-react'

const MEAL_OPTIONS = [
  { id: 'veg',       label: 'Vegetarian',     price: 250, emoji: '🥗' },
  { id: 'nonveg',    label: 'Non-Vegetarian', price: 250, emoji: '🍗' },
  { id: 'vegan',     label: 'Vegan',          price: 280, emoji: '🥦' },
  { id: 'jain',      label: 'Jain Meal',      price: 260, emoji: '🥙' },
]

const BAGGAGE_OPTIONS = [
  { id: null,    label: 'Included only',  price: 0,    sub: '15 kg included' },
  { id: '5kg',   label: '+5 kg',         price: 500,  sub: '20 kg total'    },
  { id: '10kg',  label: '+10 kg',        price: 900,  sub: '25 kg total'    },
  { id: '15kg',  label: '+15 kg',        price: 1300, sub: '30 kg total'    },
]

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
)

const AddOnsSelector = ({ passengers = 1, addOns = {}, onChange }) => {
  const [meals,   setMeals]   = useState(addOns.meals   || [])
  const [baggage, setBaggage] = useState(addOns.baggage || null)

  const toggleMeal = (mealId) => {
    const updated = meals.includes(mealId)
      ? meals.filter((m) => m !== mealId)
      : [...meals, mealId]
    setMeals(updated)
    onChange?.({ ...addOns, meals: updated, baggage })
  }

  const selectBaggage = (baggageId) => {
    setBaggage(baggageId)
    onChange?.({ ...addOns, meals, baggage: baggageId })
  }

  const mealTotal   = meals.reduce((sum, id) => {
    const opt = MEAL_OPTIONS.find((m) => m.id === id)
    return sum + (opt?.price || 0) * passengers
  }, 0)

  const baggagePrice = BAGGAGE_OPTIONS.find((b) => b.id === baggage)?.price || 0

  return (
    <div className="space-y-4">

      {/* Meals */}
      <Section icon={Utensils} title="In-flight Meals">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MEAL_OPTIONS.map((meal) => {
            const selected = meals.includes(meal.id)
            return (
              <button
                key={meal.id}
                onClick={() => toggleMeal(meal.id)}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
                  selected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                {selected && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                <span className="text-2xl">{meal.emoji}</span>
                <p className="text-xs font-semibold text-gray-800">{meal.label}</p>
                <p className="text-xs text-blue-600 font-medium">₹{meal.price}/person</p>
              </button>
            )
          })}
        </div>
        {meals.length > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            Meals for {passengers} passenger{passengers > 1 ? 's' : ''}:
            <span className="font-semibold text-gray-800 ml-1">₹{mealTotal}</span>
          </p>
        )}
      </Section>

      {/* Extra Baggage */}
      <Section icon={Luggage} title="Extra Baggage">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BAGGAGE_OPTIONS.map((opt) => {
            const selected = baggage === opt.id
            return (
              <button
                key={opt.id ?? 'none'}
                onClick={() => selectBaggage(opt.id)}
                className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                  selected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                {selected && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                <p className="text-xs text-gray-500">{opt.sub}</p>
                <p className={`text-xs font-medium mt-1 ${opt.price === 0 ? 'text-gray-400' : 'text-blue-600'}`}>
                  {opt.price === 0 ? 'Free' : `+₹${opt.price}`}
                </p>
              </button>
            )
          })}
        </div>
      </Section>

      {/* Total add-ons summary */}
      {(meals.length > 0 || baggage) && (
        <div className="bg-blue-50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-900">Add-ons Total</p>
            <p className="text-xs text-blue-600 mt-0.5">
              {[meals.length > 0 && `${meals.length} meal type(s)`, baggage && `extra baggage`].filter(Boolean).join(' · ')}
            </p>
          </div>
          <p className="text-xl font-bold text-blue-700">₹{mealTotal + baggagePrice}</p>
        </div>
      )}
    </div>
  )
}

export default AddOnsSelector
