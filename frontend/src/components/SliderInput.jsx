import React from 'react';

const SliderInput = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step, 
  unit = '', 
  sliderClass = 'slider-blue',
  inputWidth = 'w-20',
  formatValue = null,
  minLabel = '',
  maxLabel = ''
}) => {
  const handleInputChange = (e) => {
    let newValue = parseFloat(e.target.value) || 0;
    
    // Validation des limites
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    
    onChange(newValue);
  };

  const handleSliderChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  const displayValue = formatValue ? formatValue(value) : value;
  const focusRingColor = sliderClass.replace('slider-', 'focus:ring-').replace('slider-', 'focus:border-');

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label} : <span className="text-green-600 font-bold">{displayValue}</span>
      </label>
      
      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${sliderClass} mb-5`}
      />
      
      {/* Input numérique */}
      <div className="flex items-center space-x-2 mb-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputChange}
          className={`${inputWidth} px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 ${focusRingColor}`}
        />
        <span className="text-xs text-gray-500 font-medium">{unit}</span>
      </div>
      
      {/* Limites discrètes sous l'input */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{minLabel || `${min.toLocaleString()}${unit}`}</span>
        <span>{maxLabel || `${max.toLocaleString()}${unit}`}</span>
      </div>
    </div>
  );
};

export default SliderInput;