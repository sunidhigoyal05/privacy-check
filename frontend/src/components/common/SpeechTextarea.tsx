import { Textarea, Button, Tooltip } from '@nextui-org/react';
import { HiOutlineMicrophone, HiMicrophone } from 'react-icons/hi2';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { useRef, useEffect } from 'react';

interface SpeechTextareaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  minRows?: number;
  maxRows?: number;
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
  classNames?: { inputWrapper?: string; input?: string };
  isRequired?: boolean;
}

export default function SpeechTextarea({
  label,
  placeholder,
  value,
  onValueChange,
  minRows = 3,
  maxRows,
  variant = 'bordered',
  classNames,
  isRequired,
}: SpeechTextareaProps) {
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
    <div className="relative">
      <Textarea
        label={label}
        placeholder={placeholder}
        value={value}
        onValueChange={onValueChange}
        minRows={minRows}
        maxRows={maxRows}
        variant={variant}
        isRequired={isRequired}
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
                className={`absolute top-2 right-2 ${isListening ? 'animate-pulse' : ''}`}
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
      {isListening && (
        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-danger-500"></span>
          </span>
          <span className="text-xs text-danger-500">Listening...</span>
        </div>
      )}
    </div>
  );
}
