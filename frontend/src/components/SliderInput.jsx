import React, { useState } from 'react';

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
  // État local pour la valeur de l'input (permet la saisie libre)
  const [inputValue, setInputValue] = useState(value.toString());

  // Mise à jour de l'état local quand la prop value change (depuis le slider)
  React.useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e) => {
    // Permettre la saisie libre (même au-delà des limites temporairement)
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    // Validation et correction seulement à la fin de la saisie (onBlur)
    let newValue = parseFloat(inputValue) || 0;
    
    // Appliquer les limites
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    
    // Arrondir selon le step
    newValue = Math.round(newValue / step) * step;
    
    // Mettre à jour la valeur réelle
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleKeyPress = (e) => {
    // Valider directement si on appuie sur Entrée
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  const handleSliderChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
    setInputValue(newValue.toString());
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
      
      {/* Input numérique - LIBRE */}
      <div className="flex items-center space-x-2 mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          placeholder={`${min} - ${max}`}
          className={`${inputWidth} px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        />
        <span className="text-xs text-gray-500 font-medium">{unit}</span>
      </div>
      
      {/* Limites discrètes sous l'input */}
      <div className="flex justify-between text-xs text-gray-400 font-medium">
        <span>{minLabel || `${min}${unit}`}</span>
        <span>{maxLabel || `${max}${unit}`}</span>
      </div>
    </div>
  );
};

export default SliderInput;