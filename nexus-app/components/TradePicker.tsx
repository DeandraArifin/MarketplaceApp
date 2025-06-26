import React, { useState } from 'react';
import { Text } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { TradeType } from '@/types/types';

interface TradePickerProps {
  value: TradeType | '';
  onChange: (val: TradeType) => void;
  error?: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TradePicker({
  value,
  onChange,
  error,
  open,
  setOpen,
}: TradePickerProps) {
  const [items, setItems] = useState(
    Object.values(TradeType).map((trade) => ({
      label: trade,
      value: trade,
    }))
  );

  return (
    <>
      <Text>Trade</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={(callback) => {
          const selected = callback(value);
          if (typeof selected === 'string') {
            onChange(selected as TradeType);
          }
        }}
        setItems={setItems}
        placeholder="Select a trade"
        style={{ borderColor: error ? 'red' : '#ccc', marginBottom: open ? 180 : 10 }}
      />
      {error && <Text style={{ color: 'red', fontSize: 12 }}>{error}</Text>}
    </>
  );
}
