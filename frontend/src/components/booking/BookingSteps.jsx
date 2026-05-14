// components/booking/BookingSteps.jsx — Step progress indicator for the booking flow
import { Check } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Passengers',  short: 'Passengers' },
  { id: 2, label: 'Add-ons',     short: 'Add-ons'    },
  { id: 3, label: 'Review',      short: 'Review'     },
  { id: 4, label: 'Payment',     short: 'Pay'        },
]

const BookingSteps = ({ currentStep = 1 }) => {
  return (
    <div className="w-full">
      {/* Desktop — horizontal steps */}
      <div className="hidden sm:flex items-center justify-center">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isCurrent   = currentStep === step.id
          const isUpcoming  = currentStep < step.id

          return (
            <div key={step.id} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  isCompleted ? 'bg-green-500 text-white'
                  : isCurrent  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className={`text-xs font-medium mt-1.5 whitespace-nowrap ${
                  isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {index < STEPS.length - 1 && (
                <div className={`w-20 lg:w-28 h-0.5 mx-2 mb-5 transition-all ${
                  currentStep > step.id ? 'bg-green-400' : 'bg-gray-200'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile — compact progress bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.label}
          </span>
          <span className="text-xs text-gray-400">{Math.round((currentStep / STEPS.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
        {/* Step dots */}
        <div className="flex items-center justify-between mt-2">
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-2 h-2 rounded-full transition-all ${
                currentStep > step.id  ? 'bg-green-500'
                : currentStep === step.id ? 'bg-blue-600'
                : 'bg-gray-200'
              }`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BookingSteps
