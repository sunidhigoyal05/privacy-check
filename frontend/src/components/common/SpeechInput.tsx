import { Input, Button, Tooltip } from '@nextui-org/react';
import { HiOutlineMicrophone, HiMicrophone } from 'react-icons/hi2';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { useRef, useEffect } from 'react';

interface SpeechInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
  classNames?: { inputWrapper?: string; input?: string };
  isRequired?: boolean;
  type?: string;
}

export default function SpeechInput({
  label,
  placeholder,
  value,
  onValueChange,
  variant = 'bordered',
  classNames,
  isRequired,
  type,
}: SpeechInputProps) {
  const { isListening, isSupported, startListening, stopListening } = useSpeechToText();
  const baseValueRef = useRef(value);
  const onValueChangeRef = useRef(onValueChange);
  const isRecordingRef = useRef(false);

  // Keep refs in sync, but preserve base value during recording
  useEffect(() => {
    if (!isRecordingRef.current) {
      baseValueRef.current = value;
    }
    onValueChangeRef.current = onValueChange;
  }, [value, onValueChange]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      // Don't set isRecordingRef = false here - it's set in the callback when isFinal is true
    } else {
      // Store the current value as base before starting
      baseValueRef.current = value;
      isRecordingRef.current = true;
      
      startListening((text, isFinal) => {
        const baseValue = baseValueRef.current;
        const separator = baseValue && !baseValue.endsWith(' ') ? ' ' : '';
        const newValue = baseValue + separator + text;
        onValueChangeRef.current(newValue);
        
        if (isFinal) {
          // Update base value for potential continued recording
          baseValueRef.current = newValue;
          isRecordingRef.current = false;
        }
      });
    }
  };

  return (
    <Input
      label={label}
      placeholder={placeholder}
      value={value}
      onValueChange={onValueChange}
      variant={variant}
      isRequired={isRequired}
      type={type}
      classNames={{
        inputWrapper: classNames?.inputWrapper || 'border-gray-200',
        input: classNames?.input,
      }}
      endContent={
        isSupported && (
          <Tooltip 
            content={isListening ? 'Stop recording' : 'Voice input'} 
            placement="left"
          >
            <Button
              isIconOnly
              size="sm"
              variant={isListening ? 'solid' : 'light'}
              color={isListening ? 'danger' : 'default'}
              onPress={handleMicClick}
              className={isListening ? 'animate-pulse' : ''}
            >
              {isListening ? (
                <HiMicrophone size={16} className="text-white" />
              ) : (
                <HiOutlineMicrophone size={16} />
              )}
            </Button>
          </Tooltip>
        )
      }
    />
  );
}
