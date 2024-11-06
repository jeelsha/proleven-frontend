import Button from 'components/Button/Button';
import Image from 'components/Image';
import { useState } from 'react';

type CounterProps = {
  handleIncrement?: () => void;
  handleDecrement?: () => void;
  counterValue?: string;
};

const Counter = ({
  handleDecrement,
  handleIncrement,
  counterValue,
}: CounterProps) => {
  const [incrementDecrement, setIncrementDecrement] = useState(0);

  const handleIncrementDecrement = (type: string) => {
    if (type === 'increment') {
      setIncrementDecrement(incrementDecrement + 1);
    }
    if (type === 'decrement') {
      if (incrementDecrement !== 0) {
        setIncrementDecrement(incrementDecrement - 1);
      }
    }
  };

  return (
    <div className="px-2.5 py-2 bg-primaryLight rounded-lg inline-flex items-center justify-center">
      <Button
        onClickHandler={
          handleIncrement || (() => handleIncrementDecrement('increment'))
        }
        className="w-6 h-6 text-primary p-1 rounded-full border border-solid border-primary/10 hover:bg-primary hover:text-white transition-all duration-300"
      >
        <Image iconName="plusIcon" iconClassName="w-full h-full" />
      </Button>
      <Button className="min-w-12 text-center px-1 text-sm font-medium text-primary">
        {counterValue ?? incrementDecrement}
      </Button>
      <Button
        onClickHandler={
          handleDecrement || (() => handleIncrementDecrement('decrement'))
        }
        className="w-6 h-6 text-primary p-1 rounded-full border border-solid border-primary/10 hover:bg-primary hover:text-white transition-all duration-300"
      >
        <Image iconName="minusIcon" iconClassName="w-full h-full" />
      </Button>
    </div>
  );
};

export default Counter;
